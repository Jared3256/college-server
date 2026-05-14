import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export enum ExamType {
  CAT = 'CAT',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  PRACTICAL = 'PRACTICAL',
  SUPPLEMENTARY = 'SUPPLEMENTARY',
  SPECIAL = 'SPECIAL',
  RESIT = 'RESIT',
  ASSIGNMENT = 'ASSIGNMENT',
  QUIZ = 'QUIZ',
}

export enum ExamApprovalStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ExamMode {
  PHYSICAL = 'PHYSICAL',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
}

export enum ExamSessionStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
}

export enum ExamQuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  PRACTICAL = 'PRACTICAL',
}

export enum ExamDifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum ExamAttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  AUTO_SUBMITTED = 'AUTO_SUBMITTED',
  MISSED = 'MISSED',
  DISQUALIFIED = 'DISQUALIFIED',
}

export enum ExamGradingStatus {
  PENDING = 'PENDING',
  GRADED = 'GRADED',
  MODERATED = 'MODERATED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
}

export enum ExamModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CHANGES_REQUIRED = 'CHANGES_REQUIRED',
  REJECTED = 'REJECTED',
}

export enum ExamAttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXPELLED = 'EXPELLED',
}

export enum ExamMalpracticeStatus {
  UNDER_REVIEW = 'UNDER_REVIEW',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
  PENALIZED = 'PENALIZED',
}

export enum ExamPublicationVisibility {
  PRIVATE = 'PRIVATE',
  STUDENTS_ONLY = 'STUDENTS_ONLY',
  PARENTS_AND_STUDENTS = 'PARENTS_AND_STUDENTS',
  PUBLIC = 'PUBLIC',
}

export type ExamDocument = HydratedDocument<Exam>;
export type ExamSessionDocument = HydratedDocument<ExamSession>;
export type ExamEligibilityDocument = HydratedDocument<ExamEligibility>;
export type ExamQuestionDocument = HydratedDocument<ExamQuestion>;
export type ExamAttemptDocument = HydratedDocument<ExamAttempt>;
export type ExamSubmissionDocument = HydratedDocument<ExamSubmission>;
export type ExamResultDocument = HydratedDocument<ExamResult>;
export type ExamModerationDocument = HydratedDocument<ExamModeration>;
export type ExamAttendanceDocument = HydratedDocument<ExamAttendance>;
export type ExamMalpracticeDocument = HydratedDocument<ExamMalpractice>;
export type ExamPublicationDocument = HydratedDocument<ExamPublication>;
export type ExamAuditLogDocument = HydratedDocument<ExamAuditLog>;

@Schema({ collection: 'exams', timestamps: true })
export class Exam {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Semester', required: true, index: true })
  semesterId: Types.ObjectId;

  @Prop({ required: true, enum: ExamType, index: true })
  examType: ExamType;

  @Prop({ required: true, min: 0 })
  totalMarks: number;

  @Prop({ required: true, min: 0 })
  passingMarks: number;

  @Prop({ required: true, min: 1 })
  durationMinutes: number;

  @Prop({ trim: true })
  instructions?: string;

  @Prop({ required: true, min: 0, max: 100 })
  examWeightPercentage: number;

  @Prop({ default: false, index: true })
  isPublished: boolean;

  @Prop({ default: true })
  requiresApproval: boolean;

  @Prop({
    required: true,
    enum: ExamApprovalStatus,
    default: ExamApprovalStatus.DRAFT,
    index: true,
  })
  approvalStatus: ExamApprovalStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
ExamSchema.index({ courseUnitId: 1, semesterId: 1, examType: 1 });

@Schema({
  collection: 'exam_sessions',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamSession {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ required: true, index: true })
  sessionDate: Date;

  @Prop({ required: true, trim: true })
  startTime: string;

  @Prop({ required: true, trim: true })
  endTime: string;

  @Prop({ required: true, trim: true })
  room: string;

  @Prop({ required: true, enum: ExamMode })
  mode: ExamMode;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lecturer' }], default: [] })
  invigilators: Types.ObjectId[];

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({
    required: true,
    enum: ExamSessionStatus,
    default: ExamSessionStatus.SCHEDULED,
    index: true,
  })
  status: ExamSessionStatus;
}

export const ExamSessionSchema = SchemaFactory.createForClass(ExamSession);
ExamSessionSchema.index({ examId: 1, sessionDate: 1, startTime: 1 });

@Schema({
  collection: 'exam_eligibility',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamEligibility {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  attendancePercentage: number;

  @Prop({ required: true, default: false })
  feeCleared: boolean;

  @Prop({ required: true, default: false })
  disciplinaryClearance: boolean;

  @Prop({ required: true, default: false })
  registrationValid: boolean;

  @Prop({ required: true, default: false, index: true })
  eligible: boolean;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ default: Date.now })
  checkedAt: Date;
}

export const ExamEligibilitySchema =
  SchemaFactory.createForClass(ExamEligibility);
ExamEligibilitySchema.index({ studentId: 1, examId: 1 }, { unique: true });

@Schema({
  collection: 'exam_questions',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamQuestion {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  questionText: string;

  @Prop({ required: true, enum: ExamQuestionType })
  questionType: ExamQuestionType;

  @Prop({ required: true, min: 0 })
  marks: number;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  options: unknown[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  correctAnswer?: unknown;

  @Prop({ trim: true })
  explanation?: string;

  @Prop({ required: true, enum: ExamDifficultyLevel })
  difficultyLevel: ExamDifficultyLevel;

  @Prop({ required: true, min: 1 })
  order: number;
}

export const ExamQuestionSchema = SchemaFactory.createForClass(ExamQuestion);
ExamQuestionSchema.index({ examId: 1, order: 1 }, { unique: true });

@Schema({
  collection: 'exam_attempts',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamAttempt {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ExamSession', required: true })
  examSessionId: Types.ObjectId;

  @Prop()
  startedAt?: Date;

  @Prop()
  submittedAt?: Date;

  @Prop({ min: 0 })
  durationSpent?: number;

  @Prop({
    required: true,
    enum: ExamAttemptStatus,
    default: ExamAttemptStatus.NOT_STARTED,
    index: true,
  })
  status: ExamAttemptStatus;

  @Prop({ required: true, min: 1 })
  attemptNumber: number;

  @Prop({ trim: true })
  ipAddress?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  deviceMetadata?: Record<string, unknown>;
}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);
ExamAttemptSchema.index({ studentId: 1, examId: 1, status: 1 });
ExamAttemptSchema.index(
  { studentId: 1, examId: 1, attemptNumber: 1 },
  { unique: true },
);

export class ExamResponse {
  @Prop({ type: Types.ObjectId, ref: 'ExamQuestion', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  answer?: unknown;

  @Prop({ min: 0 })
  marksAwarded?: number;

  @Prop({ trim: true })
  feedback?: string;
}

@Schema({
  collection: 'exam_submissions',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamSubmission {
  @Prop({
    type: Types.ObjectId,
    ref: 'ExamAttempt',
    required: true,
    index: true,
  })
  examAttemptId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: [ExamResponse], default: [] })
  responses: ExamResponse[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop()
  submittedAt?: Date;

  @Prop()
  autoSavedAt?: Date;
}

export const ExamSubmissionSchema =
  SchemaFactory.createForClass(ExamSubmission);
ExamSubmissionSchema.index({ examAttemptId: 1 }, { unique: true });

@Schema({
  collection: 'exam_results',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamResult {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  rawScore: number;

  @Prop({ min: 0 })
  adjustedScore?: number;

  @Prop({ required: true, trim: true })
  grade: string;

  @Prop({ min: 0 })
  GPAContribution?: number;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer', required: true })
  gradedBy: Types.ObjectId;

  @Prop({
    required: true,
    enum: ExamGradingStatus,
    default: ExamGradingStatus.PENDING,
    index: true,
  })
  gradingStatus: ExamGradingStatus;

  @Prop({ default: false, index: true })
  published: boolean;

  @Prop()
  publishedAt?: Date;
}

export const ExamResultSchema = SchemaFactory.createForClass(ExamResult);
ExamResultSchema.index({ studentId: 1, examId: 1 }, { unique: true });
ExamResultSchema.index({ studentId: 1, courseUnitId: 1, published: 1 });

@Schema({
  collection: 'exam_moderation',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamModeration {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer', required: true, index: true })
  moderatorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  findings: string;

  @Prop({ trim: true })
  recommendations?: string;

  @Prop({
    required: true,
    enum: ExamModerationStatus,
    default: ExamModerationStatus.PENDING,
    index: true,
  })
  status: ExamModerationStatus;

  @Prop({ default: Date.now })
  moderatedAt: Date;
}

export const ExamModerationSchema =
  SchemaFactory.createForClass(ExamModeration);

@Schema({
  collection: 'exam_attendance',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamAttendance {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ExamSession',
    required: true,
    index: true,
  })
  examSessionId: Types.ObjectId;

  @Prop({ required: true, enum: ExamAttendanceStatus })
  attendanceStatus: ExamAttendanceStatus;

  @Prop()
  checkedInAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  verifiedBy: Types.ObjectId;
}

export const ExamAttendanceSchema =
  SchemaFactory.createForClass(ExamAttendance);
ExamAttendanceSchema.index(
  { studentId: 1, examSessionId: 1 },
  { unique: true },
);

@Schema({
  collection: 'exam_malpractice',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamMalpractice {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  incidentType: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: [String], default: [] })
  evidenceFiles: string[];

  @Prop({ trim: true })
  actionTaken?: string;

  @Prop({
    required: true,
    enum: ExamMalpracticeStatus,
    default: ExamMalpracticeStatus.UNDER_REVIEW,
    index: true,
  })
  status: ExamMalpracticeStatus;

  @Prop({ default: Date.now })
  reportedAt: Date;
}

export const ExamMalpracticeSchema =
  SchemaFactory.createForClass(ExamMalpractice);

@Schema({
  collection: 'exam_publications',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamPublication {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  publishedBy: Types.ObjectId;

  @Prop({ default: Date.now, index: true })
  publicationDate: Date;

  @Prop({ required: true, enum: ExamPublicationVisibility })
  visibility: ExamPublicationVisibility;

  @Prop({ default: false })
  notificationSent: boolean;
}

export const ExamPublicationSchema =
  SchemaFactory.createForClass(ExamPublication);

@Schema({
  collection: 'exam_audit_logs',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ExamAuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  action: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;

  @Prop({ trim: true })
  ipAddress?: string;
}

export const ExamAuditLogSchema = SchemaFactory.createForClass(ExamAuditLog);
