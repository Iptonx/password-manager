// src/modules/accounts/accounts.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AccountsService } from '../services/accounts.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CreateAccountDto } from '../dto/create-account.dto';
import { AccountResponseDto } from '../dto/account-response.dto';
import { SearchAccountDto } from '../dto/search-account.dto';
import { AccountListResponseDto } from '../dto/account-list-response.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { FavoriteAccountDto } from '../dto/favorite-account.dto';
import { BatchDeleteAccountsDto } from '../dto/batch-delete-accounts.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  async create(
    @CurrentUser() user: { userId: string; email: string },
    @Body() createDto: CreateAccountDto,
  ): Promise<AccountResponseDto> {
    const account = await this.accountsService.create(user.userId, createDto);
    return new AccountResponseDto(account);
  }

  @Get()
  async findAll(
    @CurrentUser() user: { userId: string; email: string },
    @Query() searchDto: SearchAccountDto,
  ): Promise<AccountListResponseDto> {
    const { items, total } = await this.accountsService.findAll(
      user.userId,
      searchDto,
    );
    const accountResponses = items.map(
      (account) => new AccountResponseDto(account),
    );
    return new AccountListResponseDto(
      accountResponses,
      total,
      searchDto.page || 1,
      searchDto.limit || 20,
    );
  }

  @Get('deleted')
  async getDeletedAccounts(
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.accountsService.getDeletedAccounts(user.userId);
    return accounts.map((account) => new AccountResponseDto(account));
  }

  @Get('by-category/:categoryId')
  async getAccountsByCategory(
    @CurrentUser() user: { userId: string; email: string },
    @Param('categoryId') categoryId: string,
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.accountsService.getAccountsByCategory(
      user.userId,
      categoryId,
    );
    return accounts.map((account) => new AccountResponseDto(account));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ): Promise<AccountResponseDto> {
    const account = await this.accountsService.findOne(user.userId, id);
    return new AccountResponseDto(account);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
    @Body() updateDto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    const account = await this.accountsService.update(
      user.userId,
      id,
      updateDto,
    );
    return new AccountResponseDto(account);
  }

  @Patch(':id/favorite')
  async updateFavorite(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
    @Body() favoriteDto: FavoriteAccountDto,
  ): Promise<AccountResponseDto> {
    const account = await this.accountsService.updateFavorite(
      user.userId,
      id,
      favoriteDto.isFavorite,
    );
    return new AccountResponseDto(account);
  }

  @Patch(':id/use')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLastUsed(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ): Promise<void> {
    await this.accountsService.updateLastUsed(user.userId, id);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.accountsService.remove(user.userId, id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.accountsService.restore(user.userId, id);
  }

  @Delete(':id/permanent')
  async permanentDelete(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.accountsService.permanentDelete(user.userId, id);
  }

  @Post('batch/delete')
  @HttpCode(HttpStatus.OK)
  async batchDelete(
    @CurrentUser() user: { userId: string; email: string },
    @Body() batchDto: BatchDeleteAccountsDto,
  ): Promise<{ message: string; deletedCount: number }> {
    return this.accountsService.batchDelete(user.userId, batchDto.ids);
  }

  @Get('search/by-hash/:hash')
  async findByServiceHash(
    @CurrentUser() user: { userId: string; email: string },
    @Param('hash') hash: string,
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.accountsService.getAccountsByServiceHash(
      user.userId,
      hash,
    );
    return accounts.map((account) => new AccountResponseDto(account));
  }
}
