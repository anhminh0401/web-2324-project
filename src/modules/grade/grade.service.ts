import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fastcsv from 'fast-csv';
import * as ExcelJS from 'exceljs';
import { AppDataSource } from '../../database/connect-database';
import { GradeStructure } from './entities/grade-structure.entity';
import { GradeColumnInfo, GradeUpdateInfo } from './dtos/grade-request.dto';
import { callProcedure } from '../../database/call-store-procedure';
import {
  InfoParticipantsDto,
  InfoStudentsExportDto,
} from '../class/dtos/class-request.dto';

@Injectable()
export class GradeService {
  public addColumn = async (gradeColumnInfo: GradeColumnInfo) => {
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(GradeStructure, gradeColumnInfo);
    });
    return await this.showGradeStructure(gradeColumnInfo.classId);
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
    return structure;
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

      const ws = fs.createWriteStream(filePath);
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
}
