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
    const data = await this.gradeService.addColumn(
      req.user.email,
      gradeColumnInfo,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove/:gradeId')
  async removeColumn(
    @Param('gradeId') gradeId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.removeColumn(req.user.email, gradeId);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updateColumn(
    @Body() gradeUpdateInfo: GradeUpdateInfo,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.updateColumn(
      req.user.email,
      gradeUpdateInfo,
    );
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
  async exportCsv(
    @Param('classId') classId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const buffer = await this.gradeService.exportCsv(req.user.email, classId);

    // Set the appropriate headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=grade-students.csv`,
    );

    // Send the buffer as the response
    res.status(200).send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-xlsx/:classId')
  async exportXlsx(
    @Param('classId') classId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const filePath = await this.gradeService.exportXlsx(
      req.user.email,
      classId,
    );

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
  }

  @Post('import-csv/:classId')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @Param('classId') classId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req,
  ) {
    if (!file) {
      throw Errors.badRequest;
    }

    const filePath = file.buffer;
    const data = await this.gradeService.importCsv(
      req.user.userId,
      req.user.email,
      classId,
      filePath,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark')
  async markGrade(
    @Body() infoMarkGradeDto: InfoMarkGradeDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeService.markGrade(
      req.user.email,
      infoMarkGradeDto,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-grade/:gradeId')
  async exportAssignmentCsv(
    @Param('gradeId') gradeId: number,
    @Res() res: Response,
    @Req() req,
  ) {
    const buffer = await this.gradeService.exportAssignmentCsv(
      req.user.email,
      gradeId,
    );

    // Set the appropriate headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=grade-students.csv`,
    );

    // Send the buffer as the response
    res.status(200).send(buffer);
  }

  @Post('import-assignment/:gradeId')
  @UseInterceptors(FileInterceptor('file'))
  async importAssignmentCsv(
    @Param('gradeId') gradeId: number,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Req() req,
  ) {
    if (!file) {
      throw Errors.badRequest;
    }

    const filePath = file.buffer;
    const data = await this.gradeService.importAssignmentCsv(
      req.user.email,
      gradeId,
      filePath,
    );

    res.send(new ResponseWrapper(data, null, null));
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
    @Res() res: Response,
    @Req() req,
  ) {
    const buffer = await this.gradeService.exportGradeBoard(
      req.user.email,
      classId,
    );

    // Set the appropriate headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=grade-board.csv',
    );

    // Send the buffer as the response
    res.status(200).send(buffer);
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
