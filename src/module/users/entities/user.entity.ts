import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class User extends BaseColumnEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  fullname: string;
}
