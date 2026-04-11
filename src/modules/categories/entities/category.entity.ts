// src\modules\categories\entities\category.entity.ts

import { Account } from 'src/modules/accounts/entities/account.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
@Unique('unique_category_name_per_user', ['user', 'name']) // Asegura que cada usuario no tenga categorías con el mismo nombre
@Index('idx_categories_user_id', ['userId']) // Índice para búsquedas por usuario
@Index('idx_categories_display_order', ['userId', 'displayOrder']) // Índice compuesto para ordenamiento
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  color!: string | null; // Hex color: #FF5733

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  icon!: string | null; // Nombre de ícono

  @Column({
    name: 'display_order',
    type: 'integer',
    default: 0,
  })
  displayOrder!: number;

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

  // RELACIONES
  @OneToMany(() => Account, (account) => account.category)
  accounts!: Account[];
}
