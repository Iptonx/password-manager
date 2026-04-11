// src/modules/accounts/dto/account-response.dto.ts

import { Exclude, Expose } from 'class-transformer';

export class AccountResponseDto {
  id!: string;
  userId!: string;
  categoryId!: string | null;

  // DATOS CIFRADOS (el cliente los descifrará localmente)
  serviceNameEncrypted!: string;
  usernameEncrypted!: string;
  passwordEncrypted!: string;
  notesEncrypted!: string | null;
  urlEncrypted!: string | null;

  // PARÁMETROS DE CIFRADO
  encryptionIv!: string;
  encryptionAlgorithm!: string;

  // METADATA NO CIFRADA
  serviceNameHash!: string | null;
  isFavorite!: boolean;

  // AUDITORÍA
  createdAt!: Date;
  updatedAt!: Date;
  passwordChangedAt!: Date;
  lastUsedAt!: Date | null;

  // SOFT DELETE
  isDeleted!: boolean;
  deletedAt!: Date | null;

  constructor(partial: Partial<AccountResponseDto>) {
    Object.assign(this, partial);
  }
}
