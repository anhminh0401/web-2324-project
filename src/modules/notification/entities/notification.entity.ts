import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class Notification extends BaseColumnEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  notiId: number;

  @Column({
    type: 'varchar',
    length: 32,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 32,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    default: null,
  })
  classId: string;

  @Column({ type: 'int', default: null })
  gradeId: number;

  @Column({ type: 'int', default: null })
  reviewId: number;
}
