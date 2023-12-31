import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fastcsv from 'fast-csv';
import * as ExcelJS from 'exceljs';
import * as streamifier from 'streamifier';
import { AppDataSource } from '../../database/connect-database';
import { GradeStructure } from './entities/grade-structure.entity';
import {
  GradeColumnInfo,
  GradeUpdateInfo,
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

@Injectable()
export class GradeService {
  constructor(private classService: ClassService) {}

  public addColumn = async (gradeColumnInfo: GradeColumnInfo) => {
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(GradeStructure, gradeColumnInfo);
    });
    const dataColumn = await this.showGradeStructure(gradeColumnInfo.classId);
    return dataColumn;
  };

  public removeColumn = async (gradeId: number) => {
    await AppDataSource.transaction(async (transaction) => {
      await transaction.delete(GradeStructure, { gradeId: gradeId });
    });
    return true;
  };

  public updateColumn = async (gradeUpdateInfo: GradeUpdateInfo) => {
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
    return result;
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

  public exportCsv = async (classId: string) => {
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

      const filePath = 'file/student-list.csv'; // Điều chỉnh đường dẫn tương ứng

      const ws = fs.createWriteStream(filePath, 'utf-8');
      await new Promise<void>((resolve, reject) => {
        fastcsv
          .write(csvData, { headers: true })
          .pipe(ws)
          .on('finish', resolve)
          .on('error', reject);
      });

      return filePath;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Error exporting CSV');
    }
  };
  // export student
  public async exportXlsx(classId: string): Promise<string> {
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

      const filePath = 'file/student-list.csv';

      await workbook.xlsx.writeFile(filePath);

      return filePath;
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      throw new Error('Error exporting XLSX');
    }
  }

  // import student
  public async importCsv(classId: string, fileBuffer: Buffer): Promise<void> {
    try {
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
          await this.saveStudentsToDatabase(studentsData);

          console.log('CSV file has been imported successfully');
        });
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw new Error('Error importing CSV');
    }
  }

  private async saveStudentsToDatabase(
    studentsData: { classId: string; mssv: string; fullname: string }[],
  ): Promise<void> {
    await AppDataSource.transaction(async (transaction) => {
      for (const data of studentsData) {
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

  public markGrade = async (infoMarkGrade: InfoMarkGradeDto) => {
    console.log(
      '🚀 ~ file: grade.service.ts:165 ~ GradeService ~ markGrade= ~ infoMarkGrade:',
      infoMarkGrade,
    );
    const check = await GradeStructure.findOne({
      where: { classId: infoMarkGrade.classId, gradeId: infoMarkGrade.gradeId },
    });
    if (!check) throw Errors.cannotMark;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(GradeStudent, infoMarkGrade);
    });
    return true;
  };

  public exportAssignmentCsv = async (gradeId: number) => {
    const gradeStudents = await GradeStudent.find({
      where: { gradeId: gradeId },
    });
    const csvData = gradeStudents.map((grade) => ({
      StudentId: grade.mssv,
      Grade: grade.point,
    }));

    const filePath = 'file/grade-students.csv';
    try {
      const ws = fs.createWriteStream(filePath, 'utf-8');
      await new Promise<void>((resolve, reject) => {
        fastcsv
          .write(csvData, { headers: true })
          .pipe(ws)
          .on('finish', resolve)
          .on('error', reject);
      });

      return filePath;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Error exporting CSV');
    }
  };

  public async importAssignmentCsv(
    gradeId: number,
    fileBuffer: Buffer,
  ): Promise<void> {
    const grade = await GradeStructure.findOne({ where: { gradeId: gradeId } });
    if (!grade) throw Errors.cannotImportAssignment;
    const assignmentData: {
      gradeId: number;
      classId: string;
      mssv: string;
      point: number;
    }[] = [];
    try {
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
          await this.saveAssginmentToDatabase(assignmentData);

          console.log('CSV file has been imported successfully');
        });
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw new Error('Error importing CSV');
    }
  }

  private async saveAssginmentToDatabase(
    assignmentData: {
      gradeId: number;
      classId: string;
      mssv: string;
      point: number;
    }[],
  ): Promise<void> {
    await AppDataSource.transaction(async (transaction) => {
      for (const data of assignmentData) {
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
      const convertStudent = this.combinedStudentGrades(student);
      const result = this.calculateStudentScores(convertStudent[0], structure);
      return { structure, data: result };
    }
  };

  private combinedStudentGrades = (
    studentGrades: InfoStudentGradeDto[],
  ): CombinedStudent[] => {
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

  public exportGradeBoard = async (classId: string) => {
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
              student.grades[`${grade.gradeId}`];
          }
        }
        data[`${grade.gradeName} (${grade.gradeScale}%)`] =
          student.grades[`${grade.gradeId}`];
      });
      data['final'] = student.total;
      return data;
    });

    const filePath = 'file/grade-board.csv';
    try {
      const ws = fs.createWriteStream(filePath, 'utf-8');
      await new Promise<void>((resolve, reject) => {
        fastcsv
          .write(csvData, { headers: true })
          .pipe(ws)
          .on('finish', resolve)
          .on('error', reject);
      });

      return filePath;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Error exporting CSV');
    }
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
    const teacher = await ClassTeacher.findOne({ where: { email: email } });
    if (!teacher) throw Errors.notHaveRole;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(
        GradeStructure,
        { gradeId: gradeId },
        { isView: true },
      );
    });
    return true;
  };
}
