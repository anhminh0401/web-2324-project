import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class User extends BaseColumnEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  fullname: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  uuid: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({
    type: 'varchar',
    length: 16,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  mssv: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'boolean', default: false })
  isLock: boolean;
}
