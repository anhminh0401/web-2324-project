import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class GradeStudent extends BaseColumnEntity {
  @PrimaryColumn({ type: 'int' })
  gradeId: number;

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  classId: string;

  @PrimaryColumn({
    type: 'varchar',
    length: 16,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  mssv: string;

  @Column({ type: 'float' })
  point: number;
}
