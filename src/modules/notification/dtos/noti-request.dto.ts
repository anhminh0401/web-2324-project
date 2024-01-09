export class InfoNotiRequestDto {
  type: 'grade finalized' | 'reply to review' | 'mark review' | 'have review';
  classId?: string;
  gradeId?: number;
  reviewId?: number;
  role?: 'owner' | 'teacher' | 'student';
}
