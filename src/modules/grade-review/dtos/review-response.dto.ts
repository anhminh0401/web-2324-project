import { Expose, plainToInstance } from 'class-transformer';

export class InfoListReviewDto {
  @Expose()
  mssv: string;
  @Expose()
  name: string;
  @Expose()
  classId: string;
  @Expose()
  reviewId: number;
  @Expose()
  gradeName: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoListReviewDto, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class InfoListCommentDto {
  @Expose()
  mssv: string;
  @Expose()
  name: string;
  @Expose()
  commentId: string;
  @Expose()
  reviewId: number;
  @Expose()
  message: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoListCommentDto, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class InfoDetailReview {
  @Expose()
  reviewId: number;
  @Expose()
  gradeId: number;
  @Expose()
  mssv: string;
  @Expose()
  classId: string;
  @Expose()
  expectGrade: number;
  @Expose()
  curGrade: number;
  @Expose()
  explanation: string;
  @Expose()
  isClose: boolean;
  @Expose()
  gradeName: string;
  @Expose()
  gradeScale: number;
  @Expose()
  fullname: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoDetailReview, data, {
      excludeExtraneousValues: true,
    });
  };
}
