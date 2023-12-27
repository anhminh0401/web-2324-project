import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GradeService } from './grade.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';
import { GradeColumnInfo, GradeUpdateInfo } from './dtos/grade-request.dto';

@Controller('grade')
export class GradeController {
  constructor(private gradeService: GradeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async addColumn(
    @Body() gradeColumnInfo: GradeColumnInfo,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.addColumn(gradeColumnInfo);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove/:gradeId')
  async removeColumn(
    @Param('gradeId') gradeId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.removeColumn(gradeId);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updateColumn(
    @Body() gradeUpdateInfo: GradeUpdateInfo,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.updateColumn(gradeUpdateInfo);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Get('structure/:classId')
  async showGradeStructure(
    @Param('classId') classId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.showGradeStructure(classId);
    res.send(new ResponseWrapper(data, null, null));
  }

  
}
