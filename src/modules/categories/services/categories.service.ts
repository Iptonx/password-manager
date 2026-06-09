// src/modules/categories/categories.service.ts

import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { AccountsService } from '../../accounts/services/accounts.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ReorderCategoriesDto } from '../dto/reorder-categories.dto';


@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(forwardRef(() => AccountsService))
    private accountsService: AccountsService,
  ) {}

  async create(userId: string, createDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { userId, name: createDto.name },
    });

    if (existingCategory) {
      throw new ConflictException(`Ya existe una categoría con el nombre "${createDto.name}"`);
    }

    const maxOrder = await this.getMaxDisplayOrder(userId);
    const displayOrder = createDto.displayOrder !== undefined ? createDto.displayOrder : maxOrder + 1;

    const category = this.categoryRepository.create({
      userId,
      name: createDto.name,
      color: createDto.color || null,
      icon: createDto.icon || null,
      displayOrder,
    });

    const savedCategory = await this.categoryRepository.save(category);
    this.logger.log(`Categoría creada para usuario ${userId}: ${savedCategory.name} (${savedCategory.id})`);
    
    return savedCategory;
  }

  async findAll(userId: string): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { userId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });

    // Agregar conteo de cuentas por categoría
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const accountsCount = await this.accountsService.getAccountsCountByCategory(category.id, userId);
        return {
          ...category,
          accountsCount,
        };
      })
    );

    return categoriesWithCount;
  }

  async findOne(userId: string, id: string): Promise<Category & { accountsCount: number }> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    const accountsCount = await this.accountsService.getAccountsCountByCategory(category.id, userId);

    return {
      ...category,
      accountsCount,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(userId, id);

    if (updateDto.name && updateDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { userId, name: updateDto.name },
      });
      if (existingCategory) {
        throw new ConflictException(`Ya existe una categoría con el nombre "${updateDto.name}"`);
      }
      category.name = updateDto.name;
    }

    if (updateDto.color !== undefined) {
      category.color = updateDto.color;
    }
    if (updateDto.icon !== undefined) {
      category.icon = updateDto.icon;
    }
    if (updateDto.displayOrder !== undefined) {
      category.displayOrder = updateDto.displayOrder;
    }

    const savedCategory = await this.categoryRepository.save(category);
    this.logger.log(`Categoría actualizada: ${savedCategory.name} (${id})`);
    
    return savedCategory;
  }

  async reorder(userId: string, reorderDto: ReorderCategoriesDto): Promise<Category[]> {
    for (const item of reorderDto.categories) {
      await this.categoryRepository.update(
        { id: item.id, userId },
        { displayOrder: item.displayOrder }
      );
    }

    this.logger.log(`Reordenamiento de categorías para usuario ${userId}`);
    
    return this.findAll(userId);
  }

  async remove(userId: string, id: string, moveToCategoryId?: string | null): Promise<{ message: string }> {
    
    const category = await this.findOne(userId, id);
    
    const accountsCount = category.accountsCount;

    if (accountsCount > 0 && moveToCategoryId === undefined) {
      throw new ConflictException(
        `La categoría tiene ${accountsCount} cuentas asociadas. Debes especificar una categoría de destino (moveTo=categoryId) o null para dejar sin categoría.`
      );
    }

    if (moveToCategoryId !== undefined) {
      if (moveToCategoryId === null) {
        await this.accountsService.moveAccountsToNull(category.id, userId);
      } else {
        await this.accountsService.moveAccountsToCategory(category.id, moveToCategoryId, userId);
      }
    }

    await this.categoryRepository.remove(category);
    this.logger.log(`Categoría eliminada: ${category.name} (${id}) - Cuentas movidas a ${moveToCategoryId || 'sin categoría'}`);
    
    return { message: `Categoría "${category.name}" eliminada correctamente` };
  }

  private async getMaxDisplayOrder(userId: string): Promise<number> {
    const result = await this.categoryRepository
      .createQueryBuilder('category')
      .select('MAX(category.displayOrder)', 'max')
      .where('category.userId = :userId', { userId })
      .getRawOne();
    
    return result?.max ?? -1;
  }
}