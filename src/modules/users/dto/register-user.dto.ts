// src\modules\accounts\dto\register-user.dto.ts

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(60) // bcrypt hash tiene longitud fija 60
  @MaxLength(128)
  @IsNotEmpty()
  passwordHash!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(16) // Salt mínimo recomendado
  encryptionSalt!: string;
}
