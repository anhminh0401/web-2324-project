import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../database/connect-database';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dtos/class-request.dto';
import { ClassTeacher } from './entities/class-teacher.entity';
import { ClassStudent } from './entities/class-student.entity';
import { Errors } from '../../helper/errors';

@Injectable()
export class ClassService {
  public createClass = async (params: CreateClassDto, userId: number) => {
    await AppDataSource.transaction(async (transaction) => {
      params.creatorId = userId;
      const classInfo = await transaction.save(Class, params);
      await transaction.save(ClassTeacher, {
        classId: classInfo.classId,
        teacherId: userId,
        status: true,
      });
    });
    return this.getClassOfUser(userId);
  };

  public getClassOfUser = async (userId: number) => {
    const classTeach = await Class.find({
      where: { creatorId: userId },
    });
    const classJoin = await ClassStudent.find({
      where: { studentId: userId, status: true },
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
}
