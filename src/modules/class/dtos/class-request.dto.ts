export class CreateClassDto {
  name: string;
  part?: string;
  topic?: string;
  room?: string;
  creatorId?: number;
}

export class InviteByEmailDto {
  classId: number;
  email: string;
  role: 'student' | 'teacher';
}
