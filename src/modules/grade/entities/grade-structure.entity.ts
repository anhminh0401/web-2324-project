import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class GradeStructure extends BaseColumnEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  gradeId: number;

  @Column({
    type: 'varchar',
    length: 32,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  classId: string;

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  gradeName: string;

  @Column({ type: 'int' })
  gradeScale: number;
}
