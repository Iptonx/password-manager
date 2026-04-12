// src/modules/categories/dto/category-response.dto.ts

import { Category } from '../entities/category.entity';

export class CategoryResponseDto {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  icon: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  accountsCount: number;

  constructor(category: Category & { accountsCount?: number }) {
    this.id = category.id;
    this.userId = category.userId;
    this.name = category.name;
    this.color = category.color;
    this.icon = category.icon;
    this.displayOrder = category.displayOrder;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    this.accountsCount = category.accountsCount || 0;
  }
}