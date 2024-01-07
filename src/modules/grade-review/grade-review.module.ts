import { Module } from '@nestjs/common';
import { GradeReivewService } from './grade-review.service';
import { GradeReviewController } from './grade-review.controller';
import { ClassModule } from '../class/class.module';

@Module({
  imports: [ClassModule],
  providers: [GradeReivewService],
  controllers: [GradeReviewController],
  exports: [GradeReivewService],
})
export class GradeReviewModule {}
