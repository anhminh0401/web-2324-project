import { Expose, plainToInstance } from 'class-transformer';

export class CreateClassDto {
  name: string;
  part?: string;
  topic?: string;
  room?: string;
  creatorId?: number;
  classId?: string;
}

export class InviteByEmailDto {
  classId: string;
  email: string;
  role: 'student' | 'teacher';
}

export class GetParticipantsDto {
  classId: string;
}

export class InviteLinkDto {
  classId: string;
}
export class InfoParticipantsDto {
  @Expose()
  classId: string;
  @Expose()
  userId: number;
  @Expose()
  email: string;
  @Expose()
  fullname: string;
  @Expose()
  uuid: string;
  @Expose()
  status: boolean;
  @Expose()
  mssv: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoParticipantsDto, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class InfoClassDto {
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
  email: string;
  @Expose()
  fullname: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoClassDto, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class InfoStudentsExportDto {
  fullname: string;
  @Expose()
  mssv: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoStudentsExportDto, data, {
      excludeExtraneousValues: true,
    });
  };
}
