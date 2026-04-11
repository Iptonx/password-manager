// src/modules/categories/dto/category-list-response.dto.ts

import { CategoryResponseDto } from './category-response.dto';

export class CategoryListResponseDto {
  items: CategoryResponseDto[];
  total: number;

  constructor(items: CategoryResponseDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}