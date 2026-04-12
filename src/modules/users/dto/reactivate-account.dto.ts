// src/modules/users/dto/reactivate-account.dto.ts

import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ReactivateAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
