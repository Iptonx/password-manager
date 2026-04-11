// src/modules/categories/dto/category-response.dto.ts

export class CategoryResponseDto {
  id!: string;
  userId!: string;
  name!: string;
  color!: string | null;
  icon!: string | null;
  displayOrder!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // Opcional: conteo de cuentas (si lo necesitas)
  accountsCount?: number;

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
