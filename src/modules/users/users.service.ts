import * as fastcsv from 'fast-csv';
import * as streamifier from 'streamifier';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserAdvance } from './entities/user-advance.entity';
import { InfoProfileRequest, InfoProfileResponse } from './dtos/profile.dto';
import { Errors } from '../../helper/errors';
import { AppDataSource } from '../../database/connect-database';
import { Class } from '../class/entities/class.entity';

@Injectable()
export class UsersService {
  public findOne = async (email: string): Promise<User | undefined> => {
    return User.findOne({ where: { email: email } });
  };

  public getProfile = async (userId: number) => {
    const user = User.findOne({ where: { userId: userId } });
    const userAdvance = UserAdvance.findOne({ where: { userId: userId } });
    const data = await Promise.all([user, userAdvance]);
    const result = InfoProfileResponse.fromDatabase({ ...data[0], ...data[1] });
    return result;
  };

  public editProfile = async (userId: number, info: InfoProfileRequest) => {
    const user = await User.findOne({
      where: { userId: userId },
    });
    if (!user) {
      throw Errors.findNotFoundUser;
    }

    await AppDataSource.transaction(async (transaction) => {
      if (user.fullname !== info.fullname) {
        await transaction.update(
          User,
          {
            userId: userId,
          },
          { fullname: info.fullname },
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fullname, ...infoUserAdvance } = info;
      await transaction.save(UserAdvance, {
        userId: userId,
        ...infoUserAdvance,
      });
    });
    return this.getProfile(userId);
  };

  public mapMSSV = async (userId: number, mssv: string) => {
    const user = await User.findOne({ where: { userId: userId } });
    if (!user || user.mssv !== null) throw Errors.cannotMapMSSV;
    const isMssv = await User.findOne({ where: { mssv: mssv } });
    if (isMssv) throw Errors.existMSSV;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(User, { userId: userId }, { mssv: mssv });
    });
    return true;
  };

  public getListAccount = async (adminId: number) => {
    await this.checkAdmin(adminId);
    const users = await User.find({ where: { isAdmin: false } });
    return users;
  };

  public lockAccount = async (adminId: number, userId: number) => {
    await this.checkAdmin(adminId);
    const user = await User.findOne({ where: { userId: userId } });
    await AppDataSource.transaction(async (transaction) => {
      transaction.update(User, { userId: userId }, { isLock: !user.isLock });
    });
    return true;
  };

  public checkAdmin = async (userId: number) => {
    const checkAdmin = await User.findOne({
      where: { userId: userId, isAdmin: true },
    });
    if (!checkAdmin) throw Errors.notHaveRole;
  };

  public mapMssvAdmin = async (
    adminId: number,
    userId: number,
    mssv: string,
  ) => {
    await this.checkAdmin(adminId);
    if (!mssv) {
      const isMssv = await User.findOne({ where: { mssv: mssv } });
      if (isMssv) throw Errors.existMSSV;
    }
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(User, { userId: userId }, { mssv: mssv });
    });
    return true;
  };

  public activeClass = async (adminId: number, classId: string) => {
    await this.checkAdmin(adminId);
    const checkClass = await Class.findOne({ where: { classId: classId } });
    if (!checkClass) throw Errors.findNotFoundClass;
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(
        Class,
        { classId: classId },
        { isActive: !checkClass.isActive },
      );
    });
  };

  public mapMssvByCsv = async (fileBuffer: Buffer) => {
    const infoUser: { mssv: string; userId: number }[] = [];
    try {
      const readableStream = streamifier.createReadStream(fileBuffer);

      readableStream
        .pipe(fastcsv.parse({ headers: true }))
        .on('data', (row) => {
          infoUser.push({
            mssv: row.StudentId,
            userId: row.UserId,
          });
        })
        .on('end', async () => {
          await this.mapMssvToDatabase(infoUser);
        });
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw Errors.badRequest;
    }
  };

  private mapMssvToDatabase = async (
    data: { mssv: string; userId: number }[],
  ) => {
    await AppDataSource.transaction(async (transaction) => {
      for await (const user of data) {
        await transaction.update(
          User,
          { userId: user.userId },
          { mssv: user.mssv },
        );
      }
    });
    return true;
  };
}
