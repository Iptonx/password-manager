// src/modules/accounts/dto/batch-delete-accounts.dto.ts

import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class BatchDeleteAccountsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  ids!: string[];
}
