import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class StudentReal extends BaseColumnEntity {
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

  @Column({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  fullname: string;
}
