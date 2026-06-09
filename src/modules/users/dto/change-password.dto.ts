// src/modules/users/dto/change-password.dto.ts

// import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

// export class ChangePasswordDto {
//   @IsString()
//   @IsNotEmpty()
//   currentPassword!: string;

//   @IsString()
//   @MinLength(8)
//   @MaxLength(128)
//   @IsNotEmpty()
//   newPassword!: string;
// }


import { IsString, MinLength, MaxLength, IsNotEmpty, IsOptional, ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ReEncryptedAccountDto } from './reencrypted-account.dto';
 
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;
 
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @IsNotEmpty()
  newPassword!: string;
 
  @IsString()
  @IsOptional()
  newEncryptionSalt?: string;
 
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReEncryptedAccountDto)
  @IsOptional()
  accounts?: ReEncryptedAccountDto[];
}