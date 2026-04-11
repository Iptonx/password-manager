// src/modules/categories/dto/move-category.dto.ts

import { IsUUID, IsOptional } from 'class-validator';

export class MoveCategoryDto {
  @IsUUID()
  @IsOptional()
  targetCategoryId?: string | null;  // null = sin categoría
}