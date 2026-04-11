// src/modules/users/users.controller.ts

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
import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';


@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(
    @CurrentUser() user: { userId: string; email: string },
  ): Promise<UserResponseDto> {
    const userData = await this.usersService.findById(user.userId);
    return new UserResponseDto({
      id: userData.id,
      email: userData.email,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: userData.lastLoginAt,
      isActive: userData.isActive,
    });
  }

  @Put('me')
  async updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateProfile(
      user.userId,
      updateUserDto,
    );
    return new UserResponseDto({
      id: updatedUser.id,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLoginAt: updatedUser.lastLoginAt,
      isActive: updatedUser.isActive,
    });
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: { userId: string },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(user.userId, changePasswordDto);
  }

  @Patch('me/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(
    @CurrentUser() user: { userId: string },
  ): Promise<{ message: string }> {
    return this.usersService.deactivateAccount(user.userId);
  }

  @Patch('me/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateAccount(
    @CurrentUser() user: { userId: string },
  ): Promise<{ message: string }> {
    return this.usersService.reactivateAccount(user.userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @CurrentUser() user: { userId: string },
  ): Promise<{ message: string }> {
    return this.usersService.deleteAccount(user.userId);
  }

  // Endpoints de administración (solo para admins - necesitarás un RolesGuard)
  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const { users, total } = await this.usersService.findAll(page, limit);
    const userResponses = users.map(
      (user) =>
        new UserResponseDto({
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive,
        }),
    );
    return { users: userResponses, total };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
    });
  }
}
