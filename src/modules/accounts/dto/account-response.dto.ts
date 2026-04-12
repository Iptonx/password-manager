// src/modules/accounts/dto/account-response.dto.ts

import { Account } from '../entities/account.entity';

export class AccountResponseDto {
  id: string;
  userId: string;
  categoryId: string | null;
  serviceNameEncrypted: string;
  usernameEncrypted: string;
  passwordEncrypted: string;
  notesEncrypted: string | null;
  urlEncrypted: string | null;
  encryptionIv: string;
  encryptionAlgorithm: string;
  serviceNameHash: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt: Date;
  lastUsedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;

  constructor(account: Account) {
    this.id = account.id;
    this.userId = account.userId;
    this.categoryId = account.categoryId;
    this.serviceNameEncrypted = account.serviceNameEncrypted;
    this.usernameEncrypted = account.usernameEncrypted;
    this.passwordEncrypted = account.passwordEncrypted;
    this.notesEncrypted = account.notesEncrypted;
    this.urlEncrypted = account.urlEncrypted;
    this.encryptionIv = account.encryptionIv;
    this.encryptionAlgorithm = account.encryptionAlgorithm;
    this.serviceNameHash = account.serviceNameHash;
    this.isFavorite = account.isFavorite;
    this.createdAt = account.createdAt;
    this.updatedAt = account.updatedAt;
    this.passwordChangedAt = account.passwordChangedAt;
    this.lastUsedAt = account.lastUsedAt;
    this.isDeleted = account.isDeleted;
    this.deletedAt = account.deletedAt;
  }
}