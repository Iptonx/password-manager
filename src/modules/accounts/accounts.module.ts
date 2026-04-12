import { forwardRef, Module } from '@nestjs/common';

import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
