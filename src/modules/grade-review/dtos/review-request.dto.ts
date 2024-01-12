export class InfoReviewRequestDto {
  mssv?: string;
  gradeId: number;
  classId: string;
  expectGrade: number;
  explanation: string;
}

export class InfoCommentRequestDto {
  reviewId: number;
  message: string;
}
