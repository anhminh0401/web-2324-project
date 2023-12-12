import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ClassService } from './class.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateClassDto,
  GetParticipantsDto,
  InviteByEmailDto,
  InviteLinkDto,
} from './dtos/class-request.dto';
import { ResponseWrapper } from '../../helper/response-wrapper';

@Controller('class')
export class ClassController {
  constructor(private classService: ClassService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async changePassword(
    @Body() createClassDto: CreateClassDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.classService.createClass(
      createClassDto,
      req.user.userId,
      req.user.email,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getClassOfUser(@Req() req, @Res() res: Response) {
    const data = await this.classService.getClassOfUser(req.user.userId);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('participants')
  async getTeachersAndStudentsOfClass(
    @Body() getParticipantsDto: GetParticipantsDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data =
      await this.classService.getTeachersAndStudents(getParticipantsDto);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('invite/link')
  async inviteByLink(
    @Body() inviteLinkDto: InviteLinkDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.classService.inviteByLink(
      inviteLinkDto,
      req.user.email,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('invite/email')
  async inviteByEmail(
    @Body() inviteByEmailDto: InviteByEmailDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.classService.inviteByEmail(inviteByEmailDto);
    res.send(new ResponseWrapper(data, null, null));
  }

  @Get('confirm')
  async confirmInviteByEmail(@Req() req, @Res() res: Response) {
    console.log(
      '🚀 ~ file: class.controller.ts:80 ~ ClassController ~  req.params:',
      req.query,
    );
    await this.classService.confirmInviteByEmail(
      req.query.email,
      req.query.classId,
      req.query.role,
    );
    res.redirect(`${process.env.CLIENT_URL}`);
  }
}
