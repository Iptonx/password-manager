// src/modules/categories/dto/reorder-categories.dto.ts

import { IsArray, IsUUID, ArrayMinSize, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryOrderItemDto {
  @IsUUID()
  id!: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItemDto)
  @ArrayMinSize(1)
  categories!: CategoryOrderItemDto[];
}