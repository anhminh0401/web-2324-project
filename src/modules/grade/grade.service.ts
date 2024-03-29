import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fastcsv from 'fast-csv';
import * as ExcelJS from 'exceljs';
import * as streamifier from 'streamifier';
import * as path from 'path';
import * as stream from 'stream';
import { AppDataSource } from '../../database/connect-database';
import { GradeStructure } from './entities/grade-structure.entity';
import {
  GradeColumnInfo,
  GradeUpdateInfo,
  InfoChangeNameDto,
  InfoMarkGradeDto,
  InfoStudentRealDto,
} from './dtos/grade-request.dto';
import { callProcedure } from '../../database/call-store-procedure';
import {
  InfoParticipantsDto,
  InfoStudentsExportDto,
} from '../class/dtos/class-request.dto';
import { StudentReal } from './entities/student-real.entity';
import { GradeStudent } from './entities/grade-student.entity';
import { Errors } from '../../helper/errors';
import { ClassTeacher } from '../class/entities/class-teacher.entity';
import { ClassService } from '../class/class.service';
import {
  CombinedStudent,
  InfoStudentGradeDto,
  StructureGradeResDto,
} from './dtos/grade-response.dto';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { GradeArrange } from './entities/grade-arrange.entity';

@Injectable()
export class GradeService {
  constructor(
    private classService: ClassService,
    private notiService: NotificationService,
  ) {}

  public addColumn = async (
    email: string,
    gradeColumnInfo: GradeColumnInfo,
  ) => {
    await this.classService.checkTeacher(email, gradeColumnInfo.classId);
    let length = 0;
    const arrange = await GradeArrange.findOne({
      where: { classId: gradeColumnInfo.classId },
    });
    const arrangeArr = arrange.gradeArrange.split(',').map(Number);
    if (gradeColumnInfo.gradeParent !== 0) {
      const children = await GradeStructure.findAndCount({
        where: {
          classId: gradeColumnInfo.classId,
          gradeParent: gradeColumnInfo.gradeParent,
        },
      });
      length = children[1] + 1;
    }
    await AppDataSource.transaction(async (transaction) => {
      const column = await transaction.save(GradeStructure, gradeColumnInfo);
      if (column.gradeParent === 0) {
        arrangeArr.push(column.gradeId);
        await transaction.update(
          GradeArrange,
          { classId: gradeColumnInfo.classId },
          { gradeArrange: arrangeArr.toString() },
        );
      } else {
        const firstPart = arrangeArr.slice(
          0,
          arrangeArr.indexOf(column.gradeParent) + length,
        );
        const secondPart = arrangeArr.slice(
          arrangeArr.indexOf(column.gradeParent) + length,
        );
        const newArray = [...firstPart, column.gradeId, ...secondPart];
        await transaction.update(
          GradeArrange,
          { classId: gradeColumnInfo.classId },
          { gradeArrange: newArray.toString() },
        );
      }
    });
    const dataColumn = await this.showGradeStructure(gradeColumnInfo.classId);
    return dataColumn;
  };

  public removeColumn = async (email: string, gradeId: number) => {
    const grade = await GradeStructure.findOne({ where: { gradeId } });
    await this.classService.checkTeacher(email, grade.classId);
    await AppDataSource.transaction(async (transaction) => {
      await transaction.delete(GradeStructure, { gradeParent: gradeId });
      await transaction.delete(GradeStructure, { gradeId: gradeId });
      await transaction.delete(GradeStudent, { gradeId });
    });
    return true;
  };

  public updateColumn = async (
    email: string,
    gradeUpdateInfo: GradeUpdateInfo,
  ) => {
    await this.classService.checkTeacher(email, gradeUpdateInfo.classId);

    const info = {};
    if (gradeUpdateInfo.gradeName !== undefined)
      info['gradeName'] = gradeUpdateInfo.gradeName;
    if (gradeUpdateInfo.gradeScale !== undefined)
      info['gradeScale'] = gradeUpdateInfo.gradeScale;

    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(
        GradeStructure,
        {
          gradeId: gradeUpdateInfo.gradeId,
          classId: gradeUpdateInfo.classId,
        },
        info,
      );
    });
    return true;
  };

  public showGradeStructure = async (classId: string) => {
    const structure = await GradeStructure.find({
      where: { classId: classId },
    });
    const data = StructureGradeResDto.fromDatabase(structure) as unknown;
    const typedData = data as StructureGradeResDto[];
    const result = this.combinedShowGrade(typedData);
    const arrange = await GradeArrange.findOne({ where: { classId } });
    const arrangeArr = arrange.gradeArrange.split(',').map(Number);
    const sortedData = arrangeArr
      .map((id) => {
        const item = result.find((item) => item.gradeId === id);
        if (item) {
          return {
            ...item,
            children:
              item.children && item.children.length > 0
                ? item.children.sort(
                    (a, b) => arrangeArr.indexOf(a) - arrangeArr.indexOf(b),
                  )
                : [],
          };
        }
        return null;
      })
      .filter((item) => item !== null);
    return sortedData;
  };

  private combinedShowGrade = (data: StructureGradeResDto[]) => {
    const gradeStruc = {};
    data.map((column) => {
      if (column.gradeParent === 0)
        gradeStruc[column.gradeId] = { ...column, children: [] };
      else {
        gradeStruc[column.gradeParent][column.gradeId] = column;
        gradeStruc[column.gradeParent]['children'].push(column.gradeId);
      }
    });
    const combinedGrade: StructureGradeResDto[] = Object.values(gradeStruc);
    return combinedGrade;
  };

  public addStudentReal = async (
    email: string,
    classId: string,
    infoStudent: InfoStudentRealDto,
  ) => {
    await this.classService.checkTeacher(email, classId);
    const check = await ClassTeacher.findOne({
      where: { classId: classId, email: email },
    });
    if (!check) throw Errors.notHaveRole;

    await AppDataSource.transaction(async (transaction) => {
      await transaction.insert(StudentReal, {
        classId: classId,
        mssv: infoStudent.mssv,
        fullname: infoStudent.fullname,
      });
    });
    return true;
    // TODO: return student board
  };

  public exportCsv = async (email: string, classId: string) => {
    await this.classService.checkTeacher(email, classId);
    try {
      const students = await callProcedure<InfoStudentsExportDto[]>(
        'GetClassStudent',
        [classId],
        InfoParticipantsDto,
      );
      console.log(
        '🚀 ~ file: grade.service.ts:63 ~ GradeService ~ exportCsv= ~ students:',
        students,
      );

      const csvData = students.map((student) => ({
        StudentId: student.mssv,
        FullName: student.fullname,
        // Add more properties if needed
      }));
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const writableStream = new stream.Writable();
        const chunks: any[] = [];

        writableStream._write = (chunk, encoding, next) => {
          chunks.push(chunk);
          next();
        };

        writableStream.on('finish', () => {
          resolve(Buffer.concat(chunks));
        });

        writableStream.on('error', (error) => {
          reject(error);
        });

        fastcsv.write(csvData, { headers: true }).pipe(writableStream);
      });

      return buffer;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Error exporting CSV');
    }
  };
  // export student
  public async exportXlsx(email: string, classId: string): Promise<string> {
    await this.classService.checkTeacher(email, classId);
    try {
      const students = await callProcedure<InfoStudentsExportDto[]>(
        'GetClassStudent',
        [classId],
        InfoParticipantsDto,
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('StudentList');

      // Add headers
      worksheet.addRow(['StudentId', 'FullName']);

      // Add data
      students.forEach((student) => {
        worksheet.addRow([student.mssv, student.fullname]);
        // Add more properties if needed
      });

      const filePath = path.join(__dirname, '../../student-list.csv');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      await workbook.xlsx.writeFile(filePath);

      return filePath;
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      throw new Error('Error exporting XLSX');
    }
  }

  // import student
  public importCsv = async (
    userId: number,
    email: string,
    classId: string,
    fileBuffer: Buffer,
  ): Promise<boolean> => {
    console.log('🚀 ~ GradeService ~ fileBuffer:', fileBuffer);

    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const role = await this.classService.checkRole(userId, email, classId);
        if (role !== 'owner') {
          throw Errors.notHaveRole;
        }

        const studentsData: {
          classId: string;
          mssv: string;
          fullname: string;
        }[] = [];

        const readableStream = streamifier.createReadStream(fileBuffer);

        readableStream
          .pipe(fastcsv.parse({ headers: true }))
          .on('data', (row) => {
            studentsData.push({
              classId: classId,
              mssv: row.StudentId,
              fullname: row.FullName,
            });
          })
          .on('end', async () => {
            try {
              await this.saveStudentsToDatabase(studentsData);
              resolve(true);
            } catch (error) {
              console.error('Error saving students to database:', error);
              reject(Errors.badRequest);
            }
          })
          .on('error', (error) => {
            console.error('Error parsing CSV:', error);
            reject(Errors.badRequest);
          });
      } catch (error) {
        console.error('Error importing CSV:', error);
        reject(Errors.badRequest);
      }
    });
  };

  private async saveStudentsToDatabase(
    studentsData: { classId: string; mssv: string; fullname: string }[],
  ): Promise<void> {
    await AppDataSource.transaction(async (transaction) => {
      for await (const data of studentsData) {
        const existingRecord = await StudentReal.findOne({
          where: {
            classId: data.classId,
            mssv: data.mssv,
          },
        });

        if (existingRecord) {
          existingRecord.fullname = data.fullname;
          await transaction.update(
            StudentReal,
            { classId: data.classId, mssv: data.mssv },
            existingRecord,
          );
        } else {
          await transaction.insert(StudentReal, data);
        }
      }
    });
  }

  public markGrade = async (email: string, infoMarkGrade: InfoMarkGradeDto) => {
    await this.classService.checkTeacher(email, infoMarkGrade.classId);
    const check = await GradeStructure.findOne({
      where: { classId: infoMarkGrade.classId, gradeId: infoMarkGrade.gradeId },
    });
    if (!check) throw Errors.cannotMark;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(GradeStudent, infoMarkGrade);
    });
    return true;
  };

  public exportAssignmentCsv = async (email: string, gradeId: number) => {
    const grade = await GradeStructure.findOne({ where: { gradeId } });
    if (!grade) throw Errors.findNotFoundGrade;
    await this.classService.checkTeacher(email, grade.classId);
    const gradeStudents = await GradeStudent.find({
      where: { gradeId: gradeId },
    });

    const csvData = gradeStudents.map((grade) => ({
      StudentId: grade.mssv,
      Grade: grade.point,
    }));

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const writableStream = new stream.Writable();
      const chunks: any[] = [];

      writableStream._write = (chunk, encoding, next) => {
        chunks.push(chunk);
        next();
      };

      writableStream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });

      writableStream.on('error', (error) => {
        reject(error);
      });

      fastcsv.write(csvData, { headers: true }).pipe(writableStream);
    });

    return buffer;
  };

  public importAssignmentCsv = async (
    email: string,
    gradeId: number,
    fileBuffer: Buffer,
  ): Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const grade = await GradeStructure.findOne({
          where: { gradeId: gradeId },
        });
        if (!grade) {
          throw Errors.cannotImportAssignment;
        }

        await this.classService.checkTeacher(email, grade.classId);

        const assignmentData: {
          gradeId: number;
          classId: string;
          mssv: string;
          point: number;
        }[] = [];

        const readableStream = streamifier.createReadStream(fileBuffer);

        readableStream
          .pipe(fastcsv.parse({ headers: true }))
          .on('data', (row) => {
            assignmentData.push({
              gradeId: gradeId,
              classId: grade.classId,
              mssv: row.StudentId,
              point: row.Grade,
            });
          })
          .on('end', async () => {
            try {
              await this.saveAssginmentToDatabase(assignmentData);
              resolve(true);
            } catch (error) {
              console.error('Error saving assignments to database:', error);
              reject(Errors.badRequest);
            }
          })
          .on('error', (error) => {
            console.error('Error parsing CSV:', error);
            reject(Errors.badRequest);
          });
      } catch (error) {
        console.error('Error importing CSV:', error);
        reject(Errors.badRequest);
      }
    });
  };

  private async saveAssginmentToDatabase(
    assignmentData: {
      gradeId: number;
      classId: string;
      mssv: string;
      point: number;
    }[],
  ): Promise<void> {
    await AppDataSource.transaction(async (transaction) => {
      for await (const data of assignmentData) {
        const existingRecord = await GradeStudent.findOne({
          where: {
            gradeId: data.gradeId,
            classId: data.classId,
            mssv: data.mssv,
          },
        });

        if (existingRecord) {
          // If a record with the same primary key exists, update it.
          existingRecord.point = data.point;
          await transaction.update(
            GradeStudent,
            { gradeId: data.gradeId, classId: data.classId, mssv: data.mssv },
            existingRecord,
          );
        } else {
          // If no record with the same primary key exists, insert a new record.
          await transaction.insert(GradeStudent, data);
        }
      }
    });
  }

  public showGradeBoard = async (
    userId: number,
    email: string,
    classId: string,
  ) => {
    // convert structure to calculate total
    const structure = await this.showGradeStructure(classId);
    // const structureGrades = this.combinedStructureGrades(structure);

    const role = await this.classService.checkRole(userId, email, classId);
    if (role === 'owner' || role === 'teacher') {
      const students = await callProcedure<InfoStudentGradeDto[]>(
        'GetStudentsGrade',
        [classId],
        InfoStudentGradeDto,
      );
      console.log('🚀 ~ GradeService ~ students:', students);
      const convertStudents = this.combinedStudentGrades(students);
      const result = [];
      for (const student of convertStudents) {
        result.push(this.calculateStudentScores(student, structure));
      }
      return { structure, data: result };
    } else {
      const user = await User.findOne({ where: { userId: userId } });
      if (!user || !user.mssv) throw Errors.notHaveRole;
      const student = await callProcedure<InfoStudentGradeDto[]>(
        'GetStudentGrade',
        [classId, user.mssv],
        InfoStudentGradeDto,
      );
      console.log('🚀 ~ GradeService ~ student:', student);
      let result: CombinedStudent;
      if (student && student.length > 0) {
        const convertStudent = this.combinedStudentGrades(student);
        result = this.calculateStudentScores(convertStudent[0], structure);
      } else {
        const info = await StudentReal.findOne({
          where: { classId, mssv: user.mssv },
        });
        result = {
          fullname: info.fullname,
          grades: {},
          mssv: info.mssv,
          total: 0,
        };
      }

      return { structure, data: result };
    }
  };

  private combinedStudentGrades = (
    studentGrades: InfoStudentGradeDto[],
  ): CombinedStudent[] => {
    console.log('🚀 ~ GradeService ~ studentGrades:', studentGrades);
    const studentScores = {};

    studentGrades.forEach((grade) => {
      const { mssv, fullname, gradeId, point } = grade;

      if (!studentScores[mssv]) {
        studentScores[mssv] = { mssv, fullname, grades: {} };
      }

      studentScores[mssv].grades[gradeId] = point;
    });

    const combinedStudent: CombinedStudent[] = Object.values(studentScores);
    return combinedStudent;
  };

  public exportGradeBoard = async (email: string, classId: string) => {
    await this.classService.checkTeacher(email, classId);
    const structure = await this.showGradeStructure(classId);

    const students = await callProcedure<InfoStudentGradeDto[]>(
      'GetStudentsGrade',
      [classId],
      InfoStudentGradeDto,
    );
    const convertStudents = this.combinedStudentGrades(students);
    const result = [];
    for (const student of convertStudents) {
      result.push(this.calculateStudentScores(student, structure));
    }

    const csvData = result.map((student) => {
      const data = {
        StudentId: student.mssv,
        FullName: student.fullname,
      };
      structure.map((grade) => {
        if (grade.children && grade.children.length > 0) {
          for (const childId of grade.children) {
            const childGrade = grade[childId];
            data[`${childGrade.gradeName} (${childGrade.gradeScale}%)`] =
              student.grades[`${grade.gradeId}`] || 0;
          }
        }
        data[`${grade.gradeName} (${grade.gradeScale}%)`] =
          student.grades[`${grade.gradeId}`] || 0;
      });
      data['final'] = student.total || 0;
      return data;
    });

    // const filePath = path.join(__dirname, '../../grade-board.csv');
    // fs.mkdirSync(path.dirname(filePath), { recursive: true });
    // try {
    //   const ws = fs.createWriteStream(filePath, 'utf-8');
    //   await new Promise<void>((resolve, reject) => {
    //     fastcsv
    //       .write(csvData, { headers: true })
    //       .pipe(ws)
    //       .on('finish', resolve)
    //       .on('error', reject);
    //   });

    //   return filePath;
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const writableStream = new stream.Writable();
      const chunks: any[] = [];

      writableStream._write = (chunk, encoding, next) => {
        chunks.push(chunk);
        next();
      };

      writableStream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });

      writableStream.on('error', (error) => {
        reject(error);
      });

      fastcsv.write(csvData, { headers: true }).pipe(writableStream);
    });

    return buffer;
    // } catch (error) {
    //   console.error('Error exporting CSV:', error);
    //   throw new Error('Error exporting CSV');
    // }
  };

  private calculateTotalScore = (
    student: CombinedStudent,
    grades: StructureGradeResDto[],
  ): number => {
    let totalScore = 0;

    for (const grade of grades) {
      totalScore += (student.grades[grade.gradeId] * grade.gradeScale) / 100;
    }
    return Number(totalScore.toFixed(2)) > 10
      ? 10
      : Number(totalScore.toFixed(2));
  };

  private calculateStudentScores = (
    student: CombinedStudent,
    grades: StructureGradeResDto[],
  ) => {
    const result: CombinedStudent = new CombinedStudent(
      student.mssv,
      student.fullname,
      {},
      0,
    );

    for (const grade of grades) {
      const gradeValue = student.grades[grade.gradeId];

      if (grade.children && grade.children.length > 0) {
        let total = 0;
        for (const childId of grade.children) {
          const childGrade = grade[childId];
          if (childGrade) {
            result.grades[childId] = student.grades[childId];
            total += (student.grades[childId] * childGrade.gradeScale) / 100;
          }
        }
        total = Number(((total * 100) / grade.gradeScale).toFixed(2));
        result.grades[grade.gradeId] = total > 10 ? 10 : total;
      } else {
        result.grades[grade.gradeId] = gradeValue;
      }
    }

    result.total = this.calculateTotalScore(result, grades);
    return result;
  };

  public markGradePublic = async (email: string, gradeId: number) => {
    const grade = await GradeStructure.findOne({ where: { gradeId } });
    await this.classService.checkTeacher(email, grade.classId);
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(
        GradeStructure,
        { gradeId: gradeId },
        { isView: true },
      );
    });
    // create noti
    const gradeStruc = await GradeStructure.findOne({
      where: { gradeId: gradeId },
    });
    await this.notiService.createNoti({
      type: 'grade finalized',
      classId: gradeStruc.classId,
      gradeId: gradeStruc.gradeId,
    });
    return true;
  };

  public editName = async (infoChangeName: InfoChangeNameDto) => {
    const { classId, mssv, fullname } = infoChangeName;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(
        StudentReal,
        { classId: classId, mssv: mssv },
        { fullname: fullname },
      );
    });
    return true;
  };

  public arrangeColumn = async (
    classId: string,
    data: StructureGradeResDto[],
  ) => {
    const gradeIds = data.reduce((acc, item) => {
      if (item.gradeId) {
        acc.push(item.gradeId);
      }
      if (item.children && item.children.length > 0) {
        acc.push(...item.children);
      }
      return acc;
    }, []);
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(GradeArrange, {
        classId: classId,
        gradeArrange: gradeIds.toString(),
      });
    });
    return true;
  };
}
