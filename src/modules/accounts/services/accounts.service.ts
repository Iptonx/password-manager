// src/modules/accounts/accounts.service.ts

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, ILike } from 'typeorm';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { SearchAccountDto } from '../dto/search-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';


@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(userId: string, createDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create({
      userId,
      categoryId: createDto.categoryId || null,
      serviceNameEncrypted: createDto.serviceNameEncrypted,
      usernameEncrypted: createDto.usernameEncrypted,
      passwordEncrypted: createDto.passwordEncrypted,
      notesEncrypted: createDto.notesEncrypted || null,
      urlEncrypted: createDto.urlEncrypted || null,
      encryptionIv: createDto.encryptionIv,
      encryptionAlgorithm: 'AES-256-GCM',
      serviceNameHash: createDto.serviceNameHash,
      isFavorite: createDto.isFavorite || false,
    });

    const savedAccount = await this.accountRepository.save(account);
    this.logger.log(`Cuenta creada para usuario ${userId}: ${savedAccount.id}`);
    
    return savedAccount;
  }

  async findAll(userId: string, searchDto: SearchAccountDto): Promise<{ items: Account[]; total: number }> {
    const { 
      categoryId, 
      isFavorite, 
      isDeleted = false, 
      page = 1, 
      limit = 20,
      orderBy = 'updatedAt',
      orderDirection = 'DESC'
    } = searchDto;

    const where: FindOptionsWhere<Account> = {
      userId,
      isDeleted,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    const [items, total] = await this.accountRepository.findAndCount({
      where,
      order: { [orderBy]: orderDirection },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  async findOne(userId: string, id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
    }

    return account;
  }

  async update(userId: string, id: string, updateDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(userId, id);

    // Actualizar solo los campos que vienen en el DTO
    if (updateDto.categoryId !== undefined) {
      account.categoryId = updateDto.categoryId;
    }
    if (updateDto.serviceNameEncrypted !== undefined) {
      account.serviceNameEncrypted = updateDto.serviceNameEncrypted;
    }
    if (updateDto.usernameEncrypted !== undefined) {
      account.usernameEncrypted = updateDto.usernameEncrypted;
    }
    if (updateDto.passwordEncrypted !== undefined) {
      account.passwordEncrypted = updateDto.passwordEncrypted;
      account.passwordChangedAt = new Date(); // Actualizar fecha de cambio
    }
    if (updateDto.notesEncrypted !== undefined) {
      account.notesEncrypted = updateDto.notesEncrypted;
    }
    if (updateDto.urlEncrypted !== undefined) {
      account.urlEncrypted = updateDto.urlEncrypted;
    }
    if (updateDto.encryptionIv !== undefined) {
      account.encryptionIv = updateDto.encryptionIv;
    }
    if (updateDto.serviceNameHash !== undefined) {
      account.serviceNameHash = updateDto.serviceNameHash;
    }
    if (updateDto.isFavorite !== undefined) {
      account.isFavorite = updateDto.isFavorite;
    }

    const savedAccount = await this.accountRepository.save(account);
    this.logger.log(`Cuenta actualizada: ${id}`);
    
    return savedAccount;
  }

  async updateFavorite(userId: string, id: string, isFavorite: boolean): Promise<Account> {
    const account = await this.findOne(userId, id);
    account.isFavorite = isFavorite;

    this.logger.log(`Cuenta ${id} marcada como favorita: ${isFavorite}`);

    return this.accountRepository.save(account);
  }

  async updateLastUsed(userId: string, id: string): Promise<void> {
    await this.accountRepository.update(
      { id, userId },
      { lastUsedAt: new Date() }
    );

    this.logger.log(`Cuenta actualizada (lastUsedAt): ${id}`);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const account = await this.findOne(userId, id);
    account.softDelete();
    await this.accountRepository.save(account);
    
    this.logger.log(`Cuenta eliminada (soft delete): ${id}`);
    
    return { message: 'Cuenta eliminada correctamente' };
  }

  async restore(userId: string, id: string): Promise<{ message: string }> {
    const account = await this.accountRepository.findOne({
      where: { id, userId, isDeleted: true },
    });

    if (!account) {
      throw new NotFoundException(`Cuenta eliminada con ID ${id} no encontrada`);
    }

    account.restore();
    await this.accountRepository.save(account);
    
    this.logger.log(`Cuenta restaurada: ${id}`);
    
    return { message: 'Cuenta restaurada correctamente' };
  }

  async permanentDelete(userId: string, id: string): Promise<{ message: string }> {
    const account = await this.findOne(userId, id);
    await this.accountRepository.remove(account);
    
    this.logger.log(`Cuenta eliminada permanentemente: ${id}`);
    
    return { message: 'Cuenta eliminada permanentemente' };
  }

  async batchDelete(userId: string, ids: string[]): Promise<{ message: string; deletedCount: number }> {
    let deletedCount = 0;
    
    for (const id of ids) {
      try {
        await this.remove(userId, id);
        deletedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`No se pudo eliminar cuenta ${id}: ${errorMessage}`);
      }
    }
    
    return { 
      message: `${deletedCount} de ${ids.length} cuentas eliminadas correctamente`,
      deletedCount 
    };
  }

  async getDeletedAccounts(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId, isDeleted: true },
      order: { deletedAt: 'DESC' },
    });
  }

  async getAccountsByServiceHash(userId: string, serviceNameHash: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId, serviceNameHash, isDeleted: false },
    });
  }

  // Métodos para manejo de categorías y cuentas asociadas
  async getAccountsCountByCategory(categoryId: string, userId: string): Promise<number> {
    return this.accountRepository.count({
      where: { categoryId, userId, isDeleted: false },
    });
  }

  async moveAccountsToCategory(sourceCategoryId: string, targetCategoryId: string, userId: string): Promise<void> {
    await this.accountRepository.update(
      { categoryId: sourceCategoryId, userId, isDeleted: false },
      { categoryId: targetCategoryId }
    );
    this.logger.log(`Cuentas movidas de categoría ${sourceCategoryId} a ${targetCategoryId} para usuario ${userId}`);
  }

  async moveAccountsToNull(categoryId: string, userId: string): Promise<void> {
    await this.accountRepository.update(
      { categoryId, userId, isDeleted: false },
      { categoryId: null }
    );
    this.logger.log(`Cuentas de categoría ${categoryId} movidas a null (sin categoría) para usuario ${userId}`);
  }

  async getAccountsByCategory(userId: string, categoryId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId, categoryId, isDeleted: false },
      order: { updatedAt: 'DESC' },
    });
  }

}