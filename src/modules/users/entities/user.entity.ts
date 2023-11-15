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
  username: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  fullname: string;
}
