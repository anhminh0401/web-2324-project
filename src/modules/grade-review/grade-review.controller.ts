import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GradeReivewService } from './grade-review.service';
import {
  InfoCommentRequestDto,
  InfoReviewRequestDto,
} from './dtos/review-request.dto';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';

@Controller('grade-review')
export class GradeReviewController {
  constructor(private gradeReviewService: GradeReivewService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async addColumn(
    @Body() infoReivew: InfoReviewRequestDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeReviewService.createReview(
      req.user.userId,
      req.user.email,
      infoReivew,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:classId')
  async viewReview(
    @Param('classId') classId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeReviewService.viewListReview(
      req.user.userId,
      req.user.email,
      classId,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:classId/:reviewId')
  async viewDetailReview(
    @Param('reviewId') reviewId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeReviewService.viewDetailReview(reviewId);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/comment')
  async commentReview(
    @Body() infoComment: InfoCommentRequestDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeReviewService.commentReview(
      req.user.userId,
      req.user.email,
      infoComment,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/close/:reviewId')
  async markReviewClose(
    @Param('reviewId') reviewId: number,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.gradeReviewService.markReviewClose(
      req.user.email,
      reviewId,
    );
    res.send(new ResponseWrapper(data, null, null));
  }
}
