import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class ClassStudent extends BaseColumnEntity {
  @PrimaryColumn({ type: 'int' })
  classId: number;

  @PrimaryColumn({ type: 'int' })
  studentId: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  status: boolean;
}
