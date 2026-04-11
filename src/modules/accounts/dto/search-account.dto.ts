// src/modules/accounts/dto/search-account.dto.ts

import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchAccountDto {
  @IsOptional()
  @IsString()
  serviceNameHash?: string;  // Buscar por hash exacto del servicio

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;  // Para papelera

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  orderBy?: 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'serviceNameHash' = 'updatedAt';

  @IsOptional()
  @IsString()
  orderDirection?: 'ASC' | 'DESC' = 'DESC';
}