// src/modules/categories/categories.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ReorderCategoriesDto } from '../dto/reorder-categories.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoryListResponseDto } from '../dto/category-list-response.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  async create(
    @CurrentUser() user: { userId: string; email: string },
    @Body() createDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(
      user.userId,
      createDto,
    );
    return new CategoryResponseDto(category);
  }

  @Get()
  async findAll(
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<CategoryListResponseDto> {
    const categories = await this.categoriesService.findAll(user.userId);
    const categoryResponses = categories.map(
      (category) => new CategoryResponseDto(category),
    );
    return new CategoryListResponseDto(
      categoryResponses,
      categoryResponses.length,
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findOne(user.userId, id);
    return new CategoryResponseDto(category);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(
      user.userId,
      id,
      updateDto,
    );
    return new CategoryResponseDto(category);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  async reorder(
    @CurrentUser() user: { userId: string; email: string },
    @Body() reorderDto: ReorderCategoriesDto,
  ): Promise<CategoryListResponseDto> {
    const categories = await this.categoriesService.reorder(
      user.userId,
      reorderDto,
    );
    const categoryResponses = categories.map(
      (category) => new CategoryResponseDto(category),
    );
    return new CategoryListResponseDto(
      categoryResponses,
      categoryResponses.length,
    );
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
    @Query('moveTo') moveToCategoryId?: string,
  ): Promise<{ message: string }> {

    // Convertir "null" a null y manejar undefined
    let moveTo: string | null | undefined = undefined;

    if (moveToCategoryId === 'null') {
      moveTo = null;
    } else if (moveToCategoryId) {
      moveTo = moveToCategoryId;
    }
    return this.categoriesService.remove(user.userId, id, moveTo);
    // return this.categoriesService.remove(user.userId, id, moveToCategoryId);
  }
}
