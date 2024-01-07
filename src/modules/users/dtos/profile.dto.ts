import { Expose, plainToInstance } from 'class-transformer';

export class InfoProfileRequest {
  fullname: string;
  address: string;
  dob: Date;
  avatar: string;
  phoneNumber: string;
}

export class InfoProfileResponse {
  @Expose()
  userId: number;

  @Expose()
  username: string;

  @Expose()
  fullname: string;

  @Expose()
  email: string;

  @Expose()
  address: string;

  @Expose()
  dob: Date;

  @Expose()
  avatar: string;

  @Expose()
  phoneNumber: string;

  static fromDatabase = (data) => {
    return plainToInstance(InfoProfileResponse, data, {
      excludeExtraneousValues: true,
    });
  };
}

export class InfoMssvRequest {
  mssv: string;
}
