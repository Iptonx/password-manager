// src/modules/accounts/dto/move-account.dto.ts

import { IsOptional, IsUUID } from 'class-validator';

export class MoveAccountDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;
}