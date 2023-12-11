import { Expose, plainToInstance } from 'class-transformer';

export class CreateClassDto {
  name: string;
  part?: string;
  topic?: string;
  room?: string;
  creatorId?: number;
}

export class InviteByEmailDto {
  classId: number;
  email: string;
  role: 'student' | 'teacher';
}

export class GetParticipantsDto {
  classId: number;
}

export class InviteLinkDto {
  classId: number;
}
export class InfoParticipantsDto {
  @Expose()
  classId: number;
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

  static fromDatabase = (data) => {
    return plainToInstance(InfoParticipantsDto, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class InfoClassDto {
  @Expose()
  classId: number;
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
