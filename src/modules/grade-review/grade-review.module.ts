import { Module } from '@nestjs/common';
import { GradeReivewService } from './grade-review.service';
import { GradeReviewController } from './grade-review.controller';
import { ClassModule } from '../class/class.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ClassModule, NotificationModule],
  providers: [GradeReivewService],
  controllers: [GradeReviewController],
  exports: [GradeReivewService],
})
export class GradeReviewModule {}
