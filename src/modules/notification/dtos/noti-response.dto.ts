import { Expose, plainToInstance } from 'class-transformer';

export class InfoNotiResponseDto {
  @Expose()
  notiId: number;
  @Expose()
  isRead: boolean;
  @Expose()
  classId: string;
  @Expose()
  gradeId: number;
  @Expose()
  reviewId: number;
  @Expose()
  name: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoNotiResponseDto, data, {
      excludeExtraneousValues: true,
    });
  };
}
