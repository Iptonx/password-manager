//src\modules\users\services\users.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Account } from '../../accounts/entities/account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'email',
        'createdAt',
        'updatedAt',
        'lastLoginAt',
        'isActive',
      ], // Excluir campos sensibles
    });

    return { users, total };
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Solo permitir actualizar campos no sensibles
    if (updateUserDto.email) {
      // Verificar si el nuevo email ya está en uso
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    await this.userRepository.save(user);
    return user;
  }

  // async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
  //   const user = await this.findById(userId);
  //   const { currentPassword, newPassword } = changePasswordDto;

  //   // Verificar contraseña actual
  //   const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  //   if (!isPasswordValid) {
  //     throw new BadRequestException('La contraseña actual es incorrecta');
  //   }

  //   // Generar nuevo hash para la contraseña
  //   const newPasswordHash = await bcrypt.hash(newPassword, 10);

  //   // Actualizar password hash
  //   user.passwordHash = newPasswordHash;
  //   await this.userRepository.save(user);

  //   return { message: 'Contraseña cambiada exitosamente' };
  // }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);
    const { currentPassword, newPassword, newEncryptionSalt, accounts } =
      changePasswordDto;

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Generar nuevo hash para la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;

    // Si se proporciona nuevo salt y cuentas re-encriptadas, guardarlos
    if (newEncryptionSalt) {
      user.encryptionSalt = newEncryptionSalt;
    }

    await this.userRepository.save(user);

    // Si hay cuentas re-encriptadas, actualizarlas
    // if (accounts && accounts.length > 0) {
    //   const accountRepo = this.userRepository.manager.getRepository(Account);

    //   for (const acc of accounts) {
    //     await accountRepo.update(acc.id, {
    //       serviceNameEncrypted: acc.serviceNameEncrypted,
    //       usernameEncrypted: acc.usernameEncrypted,
    //       passwordEncrypted: acc.passwordEncrypted,
    //       urlEncrypted: acc.urlEncrypted,
    //       encryptionIv: acc.encryptionIv,
    //       serviceNameHash: acc.serviceNameHash,
    //     });
    //   }
    // }
    if (accounts && accounts.length > 0) {
      for (const acc of accounts) {
        await this.accountRepository.update(acc.id, {
          serviceNameEncrypted: acc.serviceNameEncrypted,
          usernameEncrypted: acc.usernameEncrypted,
          passwordEncrypted: acc.passwordEncrypted,
          urlEncrypted: acc.urlEncrypted,
          encryptionIv: acc.encryptionIv,
          serviceNameHash: acc.serviceNameHash,
        });
      }
    }

    return { message: 'Contraseña cambiada exitosamente' };
  }

  async updateEncryptionSalt(userId: string, newSalt: string): Promise<void> {
    const user = await this.findById(userId);
    user.encryptionSalt = newSalt;
    await this.userRepository.save(user);
  }

  async deactivateAccount(userId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);
    user.isActive = false;
    await this.userRepository.save(user);
    return { message: 'Cuenta desactivada exitosamente' };
  }

  async reactivateAccount(userId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);
    user.isActive = true;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);
    return { message: 'Cuenta reactivada exitosamente' };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);
    // Soft delete o hard delete? Por ahora hard delete
    await this.userRepository.remove(user);
    return { message: 'Cuenta eliminada exitosamente' };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.incrementFailedLoginAttempts();
    await this.userRepository.save(user);
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.resetFailedLoginAttempts();
    await this.userRepository.save(user);
  }
}
