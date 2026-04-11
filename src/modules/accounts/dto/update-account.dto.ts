// src/modules/accounts/dto/update-account.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  // Nota: Todos los campos encriptados son opcionales en actualización
  // porque el cliente puede actualizar solo algunos campos
}