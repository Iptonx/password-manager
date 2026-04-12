// src/modules/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from 'src/modules/users/dto/register-user.dto';
import { RegisterResponseDto } from 'src/modules/users/dto/register-response.dto';
import { LoginUserDto } from 'src/modules/users/dto/login-user.dto';
import { LoginResponseDto } from 'src/modules/users/dto/login-response.dto';
import { ReactivateAccountDto } from 'src/modules/users/dto/reactivate-account.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    const result = await this.authService.register(registerDto);
    return new RegisterResponseDto(result.email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto): Promise<LoginResponseDto> {
    const { accessToken, encryptionSalt } =
      await this.authService.login(loginDto);
    return new LoginResponseDto(accessToken, encryptionSalt);
  }

  @Post('reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateAccount(
    @Body() reactivateDto: ReactivateAccountDto,
  ): Promise<{ message: string }> {
    return this.authService.reactivateAccount(reactivateDto);
  }
}
