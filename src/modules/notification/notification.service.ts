import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../database/connect-database';
import { Notification } from './entities/notification.entity';
import { InfoNotiRequestDto } from './dtos/noti-request.dto';
import { User } from '../users/entities/user.entity';
import { ClassStudent } from '../class/entities/class-student.entity';
import { ClassTeacher } from '../class/entities/class-teacher.entity';
import { GradeReview } from '../grade-review/entities/grade-review.entity';
import { UserNoti } from './entities/user-noti.entity';
import { InfoNotiResponseDto } from './dtos/noti-response.dto';
import { callProcedure } from '../../database/call-store-procedure';

@Injectable()
export class NotificationService {
  public createNoti = async (infoNoti: InfoNotiRequestDto) => {
    let emailList = [];
    if (infoNoti.type === 'grade finalized') {
      emailList = await ClassStudent.find({
        select: ['email'],
        where: { classId: infoNoti.classId },
      });
    } else if (infoNoti.type === 'have review') {
      emailList = await ClassTeacher.find({
        select: ['email'],
        where: { classId: infoNoti.classId },
      });
    } else if (infoNoti.type === 'reply to review') {
      if (infoNoti.role === 'student') {
        emailList = await ClassTeacher.find({
          select: ['email'],
          where: { classId: infoNoti.classId },
        });
      } else {
        const review = await GradeReview.findOne({
          where: { reviewId: infoNoti.reviewId },
        });
        emailList = await User.find({
          select: ['email'],
          where: { mssv: review.mssv },
        });
      }
    } else {
      const review = await GradeReview.findOne({
        where: { reviewId: infoNoti.reviewId },
      });
      emailList = await User.find({
        select: ['email'],
        where: { mssv: review.mssv },
      });
    }
    console.log(
      '🚀 ~ file: notification.service.ts:17 ~ NotificationService ~ createNoti= ~ emailList:',
      emailList,
    );
    await AppDataSource.transaction(async (transaction) => {
      const noti = await transaction.save(Notification, infoNoti);
      const data = emailList.map((e) => {
        return { email: e.email, notiId: noti.notiId };
      });
      console.log(
        '🚀 ~ file: notification.service.ts:62 ~ NotificationService ~ data ~ data:',
        data,
      );
      await transaction.insert(UserNoti, data);
    });
    return true;
  };

  public getListNoti = async (email: string) => {
    const listNoti = await callProcedure<InfoNotiResponseDto[]>(
      'GetListNoti',
      [email],
      InfoNotiResponseDto,
    );
    return listNoti;
  };

  public readNoti = async (email: string, notiId: number) => {
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(
        UserNoti,
        { notiId: notiId, email: email },
        { isRead: true },
      );
    });
    return true;
  };
}
