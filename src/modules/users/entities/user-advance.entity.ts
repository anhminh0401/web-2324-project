import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class UserAdvance extends BaseColumnEntity {
  @PrimaryColumn({ type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  address: string;

  @Column({ type: 'date', default: null })
  dob: Date;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  avatar: string;

  @Column({
    type: 'varchar',
    length: 16,
    default: null,
  })
  phoneNumber: string;
}
