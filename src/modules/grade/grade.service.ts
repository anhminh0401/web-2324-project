import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../database/connect-database';
import { GradeStructure } from './entities/grade-structure.entity';
import { GradeColumnInfo, GradeUpdateInfo } from './dtos/grade-request.dto';

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
}
