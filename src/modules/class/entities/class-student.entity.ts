import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class ClassStudent extends BaseColumnEntity {
  @PrimaryColumn({ type: 'int' })
  classId: number;

  @PrimaryColumn({
    type: 'varchar',
    length: 125,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  email: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  status: boolean;
}
