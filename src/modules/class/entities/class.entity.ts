import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class Class extends BaseColumnEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  classId: number;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  part: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  topic: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  room: string;

  @Column({ type: 'int' })
  creatorId: number;
}
