// src/modules/accounts/dto/batch-delete-accounts.dto.ts

import { IsArray, IsUUID, ArrayMinSize, MaxLength } from 'class-validator';

export class BatchDeleteAccountsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @MaxLength(100)
  ids!: string[];
}