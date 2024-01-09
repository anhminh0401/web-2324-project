import { Module } from '@nestjs/common';
import { GradeController } from './grade.controller';
import { GradeService } from './grade.service';
import { ClassModule } from '../class/class.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ClassModule, NotificationModule],
  providers: [GradeService],
  controllers: [GradeController],
  exports: [GradeService],
})
export class GradeModule {}
