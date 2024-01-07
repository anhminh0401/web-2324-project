import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';

@Controller('noti')
export class NotificationController {
  constructor(private notiService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getListNoti(@Req() req, @Res() res: Response) {
    const data = await this.notiService.getListNoti(req.user.email);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:notiId')
  async readNoti(
    @Param('notiId') notiId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.notiService.readNoti(req.user.email, notiId);
    res.send(new ResponseWrapper(data, null, null));
  }
}
