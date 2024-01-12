import { Expose, plainToInstance } from 'class-transformer';

export class InfoUserResponse {
  @Expose()
  userId: number;

  @Expose()
  email: string;

  @Expose()
  fullname: string;

  @Expose()
  isAdmin: boolean;

  @Expose()
  access_token: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoUserResponse, data, {
      excludeExtraneousValues: true,
    });
  };
}
