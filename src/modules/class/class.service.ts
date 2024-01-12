import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../../database/connect-database';
import { Class } from './entities/class.entity';
import {
  CreateClassDto,
  GetParticipantsDto,
  InfoClassDto,
  InfoParticipantsDto,
  InviteByEmailDto,
  InviteLinkDto,
} from './dtos/class-request.dto';
import { ClassTeacher } from './entities/class-teacher.entity';
import { ClassStudent } from './entities/class-student.entity';
import { Errors } from '../../helper/errors';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../mail/email.service';
import { ClassInvite } from './entities/class-invite.entity';
import { callProcedure } from '../../database/call-store-procedure';

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
      params.classId = uuidv4();
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
    const classTeach = await callProcedure<InfoClassDto[]>(
      'GetClassTeach',
      [userInfo.email],
      InfoClassDto,
    );
    const classJoin = await callProcedure<InfoClassDto[]>(
      'GetClassJoin',
      [userInfo.email],
      InfoClassDto,
    );
    return { teach: classTeach, join: classJoin };
  };

  public getTeachersAndStudents = async (
    getParticipantsDto: GetParticipantsDto,
  ) => {
    const { classId } = getParticipantsDto;
    if (!classId) Errors.findNotFoundClass;
    const classInfo = await Class.findOne({ where: { classId: classId } });
    if (!classInfo) Errors.findNotFoundClass;
    const teachers = await callProcedure<InfoParticipantsDto[]>(
      'GetClassTeacher',
      [classId],
      InfoParticipantsDto,
    );

    const students = await callProcedure<InfoParticipantsDto[]>(
      'GetClassStudent',
      [classId],
      InfoParticipantsDto,
    );

    return { teachers, students };
  };

  public inviteByLink = async (params: InviteLinkDto, email: string) => {
    const { classId } = params;
    const classInfo = await Class.findOne({ where: { classId: classId } });
    if (!classInfo) throw Errors.findNotFoundClass;
    const checkStudent = await ClassStudent.findOne({
      where: { email: email },
    });
    if (checkStudent) throw Errors.joinedClass;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(ClassStudent, {
        classId: classId,
        email: email,
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

  public checkRole = async (
    userId: number,
    email: string,
    classId: string,
  ): Promise<'owner' | 'teacher' | 'student'> => {
    const checkOwner = await Class.findOne({
      where: { classId: classId, creatorId: userId },
    });
    if (checkOwner) return 'owner';
    const checkTeacher = await ClassTeacher.findOne({
      where: { classId: classId, email: email },
    });
    if (checkTeacher) return 'teacher';
    const checkStudent = await ClassStudent.findOne({
      where: { classId: classId, email: email },
    });
    if (checkStudent) return 'student';
    throw Errors.notHaveRole;
  };

  public checkTeacher = async (email: string, classId: string) => {
    const teacher = await ClassTeacher.findOne({
      where: { classId: classId, email: email },
    });
    if (!teacher) throw Errors.notHaveRole;
  };

  public checkStudent = async (email: string, classId: string) => {
    const teacher = await ClassStudent.findOne({
      where: { classId: classId, email: email },
    });
    if (!teacher) throw Errors.notHaveRole;
  };
}
