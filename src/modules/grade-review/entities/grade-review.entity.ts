import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class GradeReview extends BaseColumnEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  reviewId: number;

  @Column({
    type: 'varchar',
    length: 16,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  mssv: string;

  @Column({
    type: 'varchar',
    length: 32,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  classId: string;

  @Column({ type: 'int' })
  gradeId: number;

  @Column({ type: 'float' })
  expectGrade: number;

  @Column({
    type: 'varchar',
    length: 255,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  explanation: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isClose: boolean;
}
