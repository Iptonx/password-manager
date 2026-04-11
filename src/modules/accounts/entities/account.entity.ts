// src\modules\accounts\entities\account.entity.ts

import { User } from 'src/modules/users/entities/user.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeUpdate,
} from 'typeorm';

@Entity('accounts')
@Index('idx_accounts_user_id', ['userId'])
@Index('idx_accounts_category_id', ['categoryId'])
@Index('idx_accounts_service_hash', ['serviceNameHash'])
@Index('idx_accounts_favorite', ['userId', 'isFavorite'], {
  where: 'is_favorite = true', // Índice parcial solo para favoritos
})
@Index('idx_accounts_active', ['userId'], {
  where: 'is_deleted = false', // Índice parcial solo para cuentas activas
})
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ==================== RELACIONES ====================

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    name: 'category_id',
    type: 'uuid',
    nullable: true,
  })
  categoryId!: string | null;

  @ManyToOne(() => Category, (category) => category.accounts, {
    onDelete: 'SET NULL', // Si se borra categoría, esta cuenta queda sin categoría
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  // ==================== DATOS CIFRADOS (encriptados en cliente) ====================

  @Column({
    name: 'service_name_encrypted',
    type: 'text',
    nullable: false,
  })
  serviceNameEncrypted!: string;

  @Column({
    name: 'username_encrypted',
    type: 'text',
    nullable: false,
  })
  usernameEncrypted!: string;

  @Column({
    name: 'password_encrypted',
    type: 'text',
    nullable: false,
  })
  passwordEncrypted!: string;

  @Column({
    name: 'notes_encrypted',
    type: 'text',
    nullable: true,
  })
  notesEncrypted!: string | null;

  @Column({
    name: 'url_encrypted',
    type: 'text',
    nullable: true,
  })
  urlEncrypted!: string | null;

  // ==================== PARÁMETROS DE CIFRADO ====================

  @Column({
    name: 'encryption_iv',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  encryptionIv!: string;

  @Column({
    name: 'encryption_algorithm',
    type: 'varchar',
    length: 50,
    default: 'AES-256-GCM',
  })
  encryptionAlgorithm!: string;

  // ==================== METADATA NO CIFRADA (para búsqueda/filtrado) ====================

  @Column({
    name: 'service_name_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  serviceNameHash!: string | null;

  @Column({
    name: 'last_used_at',
    type: 'timestamp',
    nullable: true,
  })
  lastUsedAt!: Date | null;

  @Column({
    name: 'is_favorite',
    type: 'boolean',
    default: false,
  })
  isFavorite!: boolean;

  // ==================== AUDITORÍA ====================

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
    name: 'password_changed_at',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  passwordChangedAt!: Date;

  // ==================== SOFT DELETE ====================

  @Column({
    name: 'is_deleted',
    type: 'boolean',
    default: false,
  })
  isDeleted!: boolean;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;

  // ==================== MÉTODOS DE UTILIDAD ====================

  /**
   * Marca la cuenta como eliminada (soft delete)
   */
  softDelete(): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
  }

  /**
   * Restaura una cuenta previamente eliminada
   */
  restore(): void {
    this.isDeleted = false;
    this.deletedAt = null;
  }

  /**
   * Actualiza la fecha de último uso
   */
  updateLastUsed(): void {
    this.lastUsedAt = new Date();
  }

  /**
   * Marca la contraseña como actualizada
   */
  updatePasswordChanged(): void {
    this.passwordChangedAt = new Date();
  }

  /**
   * Verifica si la cuenta está activa (no eliminada)
   */
  isActive(): boolean {
    return !this.isDeleted;
  }

  /**
   * Hook que se ejecuta antes de actualizar
   * Marca password_changed_at si la contraseña cambió
   */
  @BeforeUpdate()
  handlePasswordChange(): void {
    // Este hook se puede extender para detectar cambios en passwordEncrypted
    // y actualizar automáticamente passwordChangedAt
    // Nota: Necesitas implementar lógica para detectar si realmente cambió
  }
}
