import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../database/connect-database';
import { GradeReview } from './entities/grade-review.entity';
import {
  InfoCommentRequestDto,
  InfoReviewRequestDto,
} from './dtos/review-request.dto';
import { ClassService } from '../class/class.service';
import { callProcedure } from '../../database/call-store-procedure';
import { ReviewComment } from './entities/review-comment.entity';
import {
  InfoDetailReview,
  InfoListCommentDto,
  InfoListReviewDto,
} from './dtos/review-response.dto';
import { NotificationService } from '../notification/notification.service';
import { GradeStructure } from '../grade/entities/grade-structure.entity';
import { Errors } from '../../helper/errors';

@Injectable()
export class GradeReivewService {
  constructor(
    private classService: ClassService,
    private notiService: NotificationService,
  ) {}

  public createReview = async (
    userId: number,
    email: string,
    infoReivew: InfoReviewRequestDto,
  ) => {
    await AppDataSource.transaction(async (transaction) => {
      const check = await GradeStructure.findOne({
        where: { gradeId: infoReivew.gradeId },
      });
      if (!check || !check.isView) throw Errors.cannotCreateReview;
      const gradeReview = await transaction.save(GradeReview, infoReivew);
      await this.notiService.createNoti({
        type: 'have review',
        classId: infoReivew.classId,
        gradeId: infoReivew.gradeId,
        reviewId: gradeReview.reviewId,
      });
    });

    return await this.viewListReview(userId, email, infoReivew.classId);
  };

  public viewListReview = async (
    userId: number,
    email: string,
    classId: string,
  ) => {
    const role = await this.classService.checkRole(userId, email, classId);
    if (role !== 'student') userId = 0;
    const reviews = await callProcedure<InfoListReviewDto[]>(
      'GetListReview',
      [classId, userId],
      InfoListReviewDto,
    );
    return reviews;
  };

  public viewDetailReview = async (reviewId: number) => {
    const review = await callProcedure<InfoDetailReview[]>(
      'GetDetailReview',
      [reviewId],
      InfoDetailReview,
    );
    const comments = this.getListComment(reviewId);
    return { review, comments };
  };

  public commentReview = async (
    userId: number,
    email: string,
    infoComment: InfoCommentRequestDto,
  ) => {
    // save cmt
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(ReviewComment, {
        userId: userId,
        reviewId: infoComment.reviewId,
        message: infoComment.message,
      });
    });
    // create noti
    const review = await GradeReview.findOne({
      where: { reviewId: infoComment.reviewId },
    });
    const role = await this.classService.checkRole(
      userId,
      email,
      review.classId,
    );
    await this.notiService.createNoti({
      type: 'reply to review',
      classId: review.classId,
      gradeId: review.gradeId,
      reviewId: infoComment.reviewId,
      role: role,
    });
    return true;
  };

  public getListComment = async (reviewId: number) => {
    const comments = await callProcedure<InfoListCommentDto[]>(
      'GetListComment',
      [reviewId],
      InfoListCommentDto,
    );
    return comments;
  };

  public markReviewClose = async (reviewId: number) => {
    await AppDataSource.transaction(async (transaction) => {
      await transaction.update(
        GradeReview,
        { reviewId: reviewId },
        { isClose: true },
      );
    });

    // create noti
    const review = await GradeReview.findOne({
      where: { reviewId: reviewId },
    });
    await this.notiService.createNoti({
      type: 'mark review',
      classId: review.classId,
      gradeId: review.gradeId,
      reviewId: reviewId,
    });
    return true;
  };
}
