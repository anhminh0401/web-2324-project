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
import * as fs from 'fs';
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

  @UseGuards(JwtAuthGuard)
  @Get('export-csv/:classId')
  async exportCsv(@Param('classId') classId: string, @Res() res: Response) {
    try {
      const filePath = await this.gradeService.exportCsv(classId);

      // Gửi file về client
      res.download(filePath, 'student-list.csv', (err) => {
        if (err) {
          console.error('Error downloading CSV file:', err);
          res.status(500).send('Internal Server Error');
        } else {
          // Xóa file sau khi đã gửi về client (tuỳ chọn)
          fs.unlinkSync(filePath);
          console.log('CSV file has been sent and deleted successfully');
        }
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-xlsx/:classId')
  async exportXlsx(@Param('classId') classId: string, @Res() res: Response) {
    try {
      const filePath = await this.gradeService.exportXlsx(classId);

      // Gửi file về client
      res.download(filePath, 'student-list.xlsx', (err) => {
        if (err) {
          console.error('Error downloading XLSX file:', err);
          res.status(500).send('Internal Server Error');
        } else {
          // Xóa file sau khi đã gửi về client (tuỳ chọn)
          fs.unlinkSync(filePath);
          console.log('XLSX file has been sent and deleted successfully');
        }
      });
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}
