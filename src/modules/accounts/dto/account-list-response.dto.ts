// src/modules/accounts/dto/account-list-response.dto.ts

import { AccountResponseDto } from './account-response.dto';

export class AccountListResponseDto {
  items: AccountResponseDto[];
  total: number;
  page: number;
  limit: number;

  constructor(items: AccountResponseDto[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}