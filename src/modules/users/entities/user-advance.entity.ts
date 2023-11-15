import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class UserAdvance extends BaseColumnEntity {
  @PrimaryColumn({ type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 50,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  address: string;

  @Column({ type: 'date', default: null })
  dob: Date;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  avatar: string;

  @Column({
    type: 'varchar',
    length: 16,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  phoneNumber: string;
}
