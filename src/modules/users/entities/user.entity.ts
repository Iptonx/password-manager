// src\modules\users\entities\user.entity.ts

import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  @Index('idx_users_email')
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  passwordHash!: string;

  @Column({
    name: 'encryption_salt',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  encryptionSalt!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt!: Date;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Column({
    name: 'failed_login_attempts',
    type: 'integer',
    default: 0,
  })
  failedLoginAttempts!: number;

  @Column({
    name: 'locked_until',
    type: 'timestamp',
    nullable: true,
  })
  lockedUntil!: Date | null;

  // Relaciones
  @OneToMany(() => Category, (category) => category.user)
  categories!: Category[];

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  // METODOS
  // Método para verificar si la cuenta está bloqueada
  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  //   Metodo para incrementar el contador de intentos fallidos y bloquear la cuenta si se supera el límite
  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts += 1;

    // bloquear por 30 minutos después de 5 intentos fallidos
    if (this.failedLoginAttempts >= 5) {
      const lockDuration = 30 * 60 * 1000; // 30 minutos en milisegundos
      this.lockedUntil = new Date(Date.now() + lockDuration);
    }
  }

  //Método para resetear intentos fallidos despues de login exitoso
  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
  }
}
