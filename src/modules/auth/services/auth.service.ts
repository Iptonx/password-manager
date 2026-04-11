// src/modules/auth/auth.service.ts

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';
import { RegisterUserDto } from 'src/modules/users/dto/register-user.dto';
import { LoginUserDto } from 'src/modules/users/dto/login-user.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<{ message: string; email: string }> {
    const { email, passwordHash, encryptionSalt } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Crear nuevo usuario (el cliente ya generó passwordHash y encryptionSalt)
    const user = this.userRepository.create({
      email,
      passwordHash,
      encryptionSalt,
      isActive: true,
      failedLoginAttempts: 0,
    });

    await this.userRepository.save(user);

    return {
      message: 'Usuario registrado exitosamente',
      email: user.email,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    // Buscar usuario por email
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si cuenta está bloqueada
    if (user.isLocked()) {
      throw new UnauthorizedException('La cuenta está bloqueada. Intente nuevamente más tarde.');
    }

    // Verificar si cuenta está activa
    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta está desactivada.');
    }

    // Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      user.incrementFailedLoginAttempts();
      await this.userRepository.save(user);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Resetear intentos fallidos en login exitoso
    user.resetFailedLoginAttempts();
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return user;
  }

  async login(loginDto: LoginUserDto): Promise<{ accessToken: string; encryptionSalt: string }> {
    const { email, password } = loginDto;
    
    // Validar credenciales
    const user = await this.validateUser(email, password);
    
    // Generar JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    
    return {
      accessToken,
      encryptionSalt: user.encryptionSalt,
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}