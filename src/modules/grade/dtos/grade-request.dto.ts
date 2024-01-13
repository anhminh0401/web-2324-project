export class GradeColumnInfo {
  classId: string;
  gradeName: string;
  gradeScale: number;
  gradeParent?: number;
}

export class GradeUpdateInfo {
  gradeId: number;
  classId: string;
  gradeName: string;
  gradeScale: number;
  gradeParent?: number;
}

export class InfoMarkGradeDto {
  gradeId: number;
  classId: string;
  mssv: string;
  point: number;
}

export class InfoStudentRealDto {
  mssv: string;
  fullname: string;
}

export class InfoFinalizedDto {
  gradeId: number;
}

export class InfoChangeNameDto {
  classId: string;
  mssv: string;
  fullname: string;
}
