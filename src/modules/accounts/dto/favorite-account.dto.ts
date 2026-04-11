// src/modules/accounts/dto/favorite-account.dto.ts

import { IsBoolean, IsNotEmpty } from 'class-validator';

export class FavoriteAccountDto {
  @IsBoolean()
  @IsNotEmpty()
  isFavorite!: boolean;
}