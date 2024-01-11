import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { InfoMssvRequest, InfoProfileRequest } from './dtos/profile.dto';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Errors } from '../../helper/errors';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req, @Res() res: Response) {
    const data = await this.usersService.getProfile(req.user.userId);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  async editProfile(
    @Body() info: InfoProfileRequest,
    @Request() req,
    @Res() res: Response,
  ) {
    const data = await this.usersService.editProfile(req.user.userId, info);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Post('map-mssv')
  async mapMSSV(
    @Body() info: InfoMssvRequest,
    @Request() req,
    @Res() res: Response,
  ) {
    const data = await this.usersService.mapMSSV(req.user.userId, info.mssv);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Get('admin/accounts')
  async getListAccount(@Request() req, @Res() res: Response) {
    const data = await this.usersService.getListAccount(req.user.userId);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Post('admin/lock')
  async lockAccount(
    @Body() info: { userId: number },
    @Request() req,
    @Res() res: Response,
  ) {
    const data = await this.usersService.lockAccount(
      req.user.userId,
      info.userId,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Post('admin/map-mssv')
  async mapMssvAdmin(
    @Body() info: { userId: number; mssv: string },
    @Request() req,
    @Res() res: Response,
  ) {
    const data = await this.usersService.mapMssvAdmin(
      req.user.userId,
      info.userId,
      info.mssv,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Post('admin/active-class')
  async activeClass(
    @Body() info: { classId: string },
    @Request() req,
    @Res() res: Response,
  ) {
    const data = await this.usersService.activeClass(
      req.user.userId,
      info.classId,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @Post('admin/import-mssv')
  @UseInterceptors(FileInterceptor('file'))
  async mapMssvByCsv(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    console.log(
      '🚀 ~ file: grade.controller.ts:123 ~ GradeController ~ file:',
      file,
    );
    if (!file) {
      throw Errors.badRequest;
    }

    const fileBuffer = file.buffer;
    const data = await this.usersService.mapMssvByCsv(fileBuffer);

    return res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Get('admin/classes')
  async getListClasses(@Request() req, @Res() res: Response) {
    const data = await this.usersService.getAllClass(req.user.userId);
    res.send(new ResponseWrapper(data, null, null));
  }
}
