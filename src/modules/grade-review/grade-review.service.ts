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

@Injectable()
export class GradeReivewService {
  constructor(private classService: ClassService) {}

  public createReview = async (
    userId: number,
    email: string,
    infoReivew: InfoReviewRequestDto,
  ) => {
    await AppDataSource.transaction(async (transaction) => {
      await transaction.insert(GradeReview, infoReivew);
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
      'GetReviewByTeacher',
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
    infoComment: InfoCommentRequestDto,
  ) => {
    await AppDataSource.transaction(async (transaction) => {
      await transaction.save(ReviewComment, {
        userId: userId,
        reviewId: infoComment.reviewId,
        message: infoComment.message,
      });
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
    return true;
  };
}
