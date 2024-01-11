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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as fs from 'fs';
import { GradeService } from './grade.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';
import {
  GradeColumnInfo,
  GradeUpdateInfo,
  InfoChangeNameDto,
  InfoFinalizedDto,
  InfoMarkGradeDto,
  InfoStudentRealDto,
} from './dtos/grade-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Errors } from '../../helper/errors';

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
          throw Errors.badRequest;
        } else {
          // Xóa file sau khi đã gửi về client (tuỳ chọn)
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw Errors.badRequest;
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
          throw Errors.badRequest;
        } else {
          // Xóa file sau khi đã gửi về client (tuỳ chọn)
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      throw Errors.badRequest;
    }
  }

  @Post('import-csv/:classId')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @Param('classId') classId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        throw Errors.badRequest;
      }

      const filePath = file.buffer;
      const data = await this.gradeService.importCsv(classId, filePath);
      res.send(new ResponseWrapper(data, null, null));
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw Errors.badRequest;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark')
  async markGrade(
    @Body() infoMarkGradeDto: InfoMarkGradeDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.markGrade(infoMarkGradeDto);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-grade/:gradeId')
  async exportAssignmentCsv(
    @Param('gradeId') gradeId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const filePath = await this.gradeService.exportAssignmentCsv(gradeId);

      // Gửi file về client
      res.download(filePath, 'student-list.csv', (err) => {
        if (err) {
          console.error('Error downloading CSV file:', err);
          throw Errors.badRequest;
        } else {
          // Xóa file sau khi đã gửi về client (tuỳ chọn)
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw Errors.badRequest;
    }
  }

  @Post('import-assignment/:gradeId')
  @UseInterceptors(FileInterceptor('file'))
  async importAssignmentCsv(
    @Param('gradeId') gradeId: number,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        throw Errors.badRequest;
      }

      const filePath = file.buffer;
      const data = await this.gradeService.importAssignmentCsv(
        gradeId,
        filePath,
      );

      res.send(new ResponseWrapper(data, null, null));
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw Errors.badRequest;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-student/:classId')
  async addStudentReal(
    @Param('classId') classId: string,
    @Body() infoStudentRealDto: InfoStudentRealDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.addStudentReal(
      req.user.email,
      classId,
      infoStudentRealDto,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':classId')
  async showGradeBoard(
    @Param('classId') classId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.showGradeBoard(
      req.user.userId,
      req.user.email,
      classId,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @Get('export-board/:classId')
  async exportGradeBoard(
    @Param('classId') classId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const filePath = await this.gradeService.exportGradeBoard(classId);

      // Gửi file về client
      res.download(filePath, 'grade-board.csv', (err) => {
        if (err) {
          console.error('Error downloading CSV file:', err);
          throw Errors.serverError;
        } else {
          // Xóa file sau khi đã gửi về client (tuỳ chọn)
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw Errors.serverError;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('finalized')
  async markGradePublic(
    @Body() infoFinalized: InfoFinalizedDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.markGradePublic(
      req.user.email,
      infoFinalized.gradeId,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/change-name')
  async editName(
    @Body() infoChangeName: InfoChangeNameDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.editName(infoChangeName);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/arrange/:classId')
  async arrangeColumn(
    @Param('classId') classId: string,
    @Body() infoStruct,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.arrangeColumn(classId, infoStruct);
    res.send(new ResponseWrapper(data, null, null));
  }
}
