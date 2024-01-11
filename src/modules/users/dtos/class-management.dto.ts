import { Expose, plainToInstance } from 'class-transformer';

export class InfoAllClassDto {
  @Expose()
  classId: string;
  @Expose()
  name: string;
  @Expose()
  part: string;
  @Expose()
  topic: string;
  @Expose()
  room: string;
  @Expose()
  isActive: boolean;
  @Expose()
  emai: string;
  @Expose()
  fullname: string;
  @Expose()
  amount: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoAllClassDto, data, {
      excludeExtraneousValues: true,
    });
  };
}
