import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class ClassTeacher extends BaseColumnEntity {
  @PrimaryColumn({ type: 'int' })
  classId: number;

  @PrimaryColumn({ type: 'int' })
  teacherId: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  status: boolean;
}
