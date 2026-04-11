// src/modules/users/dto/user-response.dto.ts

import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  id!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;
  lastLoginAt!: Date | null;
  isActive!: boolean;

  // EXCLUIDOS DE LA RESPUESTA (no se envían al cliente)
  @Exclude()
  passwordHash!: string;

  @Exclude()
  encryptionSalt!: string;

  @Exclude()
  failedLoginAttempts!: number;

  @Exclude()
  lockedUntil!: Date | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}