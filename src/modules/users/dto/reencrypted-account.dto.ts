import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
 
export class ReEncryptedAccountDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
 
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
  urlEncrypted!: string | null;
 
  @IsString()
  @IsNotEmpty()
  encryptionIv!: string;
 
  @IsString()
  @IsNotEmpty()
  serviceNameHash!: string;
}