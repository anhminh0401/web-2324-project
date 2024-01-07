import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseColumnEntity } from '../../base/base.entity';

@Entity()
export class ReviewComment extends BaseColumnEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  commentId: number;

  @Column({ type: 'int' })
  reviewId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 255,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
  })
  message: string;
}
