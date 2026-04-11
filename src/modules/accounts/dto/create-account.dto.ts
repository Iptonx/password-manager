// src/modules/accounts/dto/create-account.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  // DATOS CIFRADOS (el cliente envía ya encriptados)
  @IsString()
  @IsNotEmpty()
  serviceNameEncrypted!: string;

  @IsString()
  @IsNotEmpty()
  usernameEncrypted!: string;

  @IsString()
  @IsNotEmpty()
  passwordEncrypted!: string;

  @IsString()
  @IsOptional()
  notesEncrypted?: string | null;

  @IsUrl()
  @IsOptional()
  @MaxLength(2048)
  urlEncrypted?: string | null;

  // PARÁMETROS DE CIFRADO
  @IsString()
  @IsNotEmpty()
  encryptionIv!: string; // IV generado por cliente para AES-GCM

  // METADATA NO CIFRADA (para búsqueda)
  @IsString()
  @IsNotEmpty()
  serviceNameHash!: string; // SHA256 del nombre del servicio

  // OPCIONALES
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;
}
