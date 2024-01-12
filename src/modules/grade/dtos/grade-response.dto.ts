import { Expose, plainToInstance } from 'class-transformer';

export class InfoStudentGradeDto {
  @Expose()
  mssv: string;

  @Expose()
  fullname: string;

  @Expose()
  gradeId: number;

  @Expose()
  point: number;

  static fromDatabase = (data) => {
    return plainToInstance(InfoStudentGradeDto, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class StructureGradeResDto {
  @Expose()
  gradeId: number;

  @Expose()
  classId: string;

  @Expose()
  gradeName: string;

  @Expose()
  gradeScale: number;

  @Expose()
  gradeParent: number;

  @Expose()
  isView: boolean;

  children?: number[];

  static fromDatabase = (data) => {
    return plainToInstance(StructureGradeResDto, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class CombinedStudent {
  mssv: string;
  fullname: string;
  grades: Record<string, number>;
  total?: number;

  constructor(
    mssv: string,
    fullname: string,
    grades: Record<string, number>,
    total?: number,
  ) {
    this.mssv = mssv;
    this.fullname = fullname;
    this.grades = grades;
    this.total = total;
  }
}
