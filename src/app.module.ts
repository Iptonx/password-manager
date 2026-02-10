import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AccountsModule } from './modules/accounts/accounts.module';

@Module({
  imports: [UsersModule, CategoriesModule, AccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
