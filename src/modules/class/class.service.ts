import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../database/connect-database';
import { Class } from './entities/class.entity';
import { CreateClassDto, InviteByEmailDto } from './dtos/class-request.dto';
import { ClassTeacher } from './entities/class-teacher.entity';
import { ClassStudent } from './entities/class-student.entity';
import { Errors } from '../../helper/errors';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../mail/email.service';
import { ClassInvite } from './entities/class-invite.entity';

@Injectable()
export class ClassService {
  constructor(private emailService: EmailService) {}

  public createClass = async (
    params: CreateClassDto,
    userId: number,
    email: string,
  ) => {
    await AppDataSource.transaction(async (transaction) => {
      params.creatorId = userId;
      const classInfo = await transaction.save(Class, params);
      await transaction.save(ClassTeacher, {
        classId: classInfo.classId,
        email: email,
        status: true,
      });
    });
    return this.getClassOfUser(userId);
  };

  public getClassOfUser = async (userId: number) => {
    const userInfo = await User.findOne({ where: { userId: userId } });
    const classTeach = await ClassTeacher.find({
      where: { email: userInfo.email, status: true },
    });
    const classJoin = await ClassStudent.find({
      where: { email: userInfo.email, status: true },
    });
    return { teach: classTeach, join: classJoin };
  };

  public getTeachersAndStudents = async (classId: number) => {
    if (!classId) Errors.findNotFoundClass;
    const classInfo = await Class.findOne({ where: { classId: classId } });
    if (!classInfo) Errors.findNotFoundClass;
    const teachers = await ClassTeacher.find({ where: { classId: classId } });
    const students = await ClassStudent.find({ where: { classId: classId } });
    return { teachers, students };
  };

  public inviteByLink = async (classId: number, userId: number) => {
    const classInfo = await Class.findOne({ where: { classId: classId } });
    if (!classInfo) Errors.findNotFoundClass;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(ClassStudent, {
        classId: classId,
        studentId: userId,
        status: true,
      });
    });
    return true;
  };

  public inviteByEmail = async (params: InviteByEmailDto) => {
    const { classId, email, role } = params;
    const classInfo = await Class.findOne({ where: { classId: classId } });
    if (!classInfo) Errors.findNotFoundClass;

    // if dont have account will save in another table
    const userInfo = await User.findOne({ where: { email: email } });
    if (!userInfo) {
      const roleId = role === 'student' ? 1 : 2;
      await AppDataSource.transaction(async (transaction) => {
        await transaction.save(ClassInvite, {
          classId: classId,
          email: email,
          role: roleId,
        });
      });
    }
    await AppDataSource.transaction(async (transaction) => {
      if (role === 'student') {
        await transaction.save(ClassStudent, {
          classId: classId,
          email: email,
          status: false,
        });
      } else {
        await transaction.save(ClassTeacher, {
          classId: classId,
          email: email,
          status: false,
        });
      }
    });

    await this.emailService.sendConfirmationEmail(email, classId, role);
    return true;
  };

  public confirmInviteByEmail = async (
    email: string,
    classId: number,
    role: string,
  ) => {
    const userInfo = await User.findOne({ where: { email: email } });
    if (!userInfo) {
      await AppDataSource.transaction(async (transaction) => {
        await transaction.update(
          ClassInvite,
          {
            classId: classId,
            email: email,
          },
          { status: true },
        );
      });
    } else {
      await AppDataSource.transaction(async (transaction) => {
        if (role === 'student') {
          await transaction.update(
            ClassStudent,
            {
              classId: classId,
              email: userInfo.email,
            },
            {
              status: true,
            },
          );
        } else {
          await transaction.update(
            ClassTeacher,
            {
              classId: classId,
              email: userInfo.email,
            },
            {
              status: true,
            },
          );
        }
      });
    }
    return true;
  };
}