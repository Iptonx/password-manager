// src/modules/accounts/dto/password-change.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  passwordEncrypted!: string;  // Nueva contraseña ya cifrada con master_key

  @IsString()
  @IsNotEmpty()
  encryptionIv!: string;  // Nuevo IV usado para el cifrado
}