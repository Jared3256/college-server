import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Attendance,
  AttendanceStatus,
} from '../attendance/entities/attendance.entity';
import {
  CourseUnit,
  CourseUnitDocument,
} from '../course-unit/entities/course-unit.entity';
import {
  Enrollment,
  EnrollmentStatus,
} from '../enrollment/entities/enrollment.entity';
import {
  Lecturer,
  LecturerDocument,
} from '../lecturer/entities/lecturer.entity';
import {
  Semester,
  SemesterDocument,
} from '../semester/entities/semester.entity';
import { Student, StudentDocument } from '../student/entities/student.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import {
  ArchiveExamDto,
  AutoSaveExamSubmissionDto,
  CreateExamAttendanceDto,
  CreateExamAttemptDto,
  CreateExamDto,
  CreateExamEligibilityDto,
  CreateExamMalpracticeDto,
  CreateExamModerationDto,
  CreateExamQuestionDto,
  CreateExamResultDto,
  CreateExamSessionDto,
  ExamSubmissionResponseDto,
  PublishExamResultsDto,
  StartExamAttemptDto,
  SubmitExamSubmissionDto,
  UpdateExamApprovalDto,
} from './dto/create-exam.dto';
import {
  UpdateExamAttendanceDto,
  UpdateExamDto,
  UpdateExamEligibilityDto,
  UpdateExamMalpracticeDto,
  UpdateExamModerationDto,
  UpdateExamQuestionDto,
  UpdateExamResultDto,
  UpdateExamSessionDto,
} from './dto/update-exam.dto';
import {
  Exam,
  ExamApprovalStatus,
  ExamAttempt,
  ExamAttemptDocument,
  ExamAttemptStatus,
  ExamAuditLog,
  ExamAuditLogDocument,
  ExamAttendance,
  ExamAttendanceDocument,
  ExamDocument,
  ExamEligibility,
  ExamEligibilityDocument,
  ExamGradingStatus,
  ExamMalpractice,
  ExamMalpracticeDocument,
  ExamMalpracticeStatus,
  ExamModeration,
  ExamModerationDocument,
  ExamModerationStatus,
  ExamPublication,
  ExamPublicationDocument,
  ExamQuestion,
  ExamQuestionDocument,
  ExamResponse,
  ExamResult,
  ExamResultDocument,
  ExamSession,
  ExamSessionDocument,
  ExamSessionStatus,
  ExamSubmission,
  ExamSubmissionDocument,
  ExamType,
} from './entities/exam.entity';

const EXAM_ATTENDANCE_THRESHOLD_PERCENTAGE = 75;

interface MongoServerErrorShape {
  code?: number;
}

interface ExamUpdateFields {
  title?: string;
  description?: string;
  courseUnitId?: Types.ObjectId;
  semesterId?: Types.ObjectId;
  examType?: ExamType;
  totalMarks?: number;
  passingMarks?: number;
  durationMinutes?: number;
  instructions?: string;
  examWeightPercentage?: number;
  isPublished?: boolean;
  requiresApproval?: boolean;
  approvalStatus?: ExamApprovalStatus;
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
}

interface ExamSessionUpdateFields {
  sessionDate?: Date;
  startTime?: string;
  endTime?: string;
  room?: string;
  mode?: CreateExamSessionDto['mode'];
  invigilators?: Types.ObjectId[];
  capacity?: number;
  status?: ExamSessionStatus;
}

interface EligibilityFacts {
  student: StudentDocument;
  attendancePercentage: number;
  feeCleared: boolean;
  disciplinaryClearance: boolean;
  registrationValid: boolean;
  eligible: boolean;
  remarks?: string;
}

interface EligibilityComputationInput {
  studentId: string;
  attendancePercentage: number;
  feeCleared: boolean;
  disciplinaryClearance: boolean;
  remarks?: string;
}

interface ExamQuestionUpdateFields {
  questionText?: string;
  questionType?: CreateExamQuestionDto['questionType'];
  marks?: number;
  options?: unknown[];
  correctAnswer?: unknown;
  explanation?: string;
  difficultyLevel?: CreateExamQuestionDto['difficultyLevel'];
  order?: number;
}

interface ExamResultUpdateFields {
  studentId?: Types.ObjectId;
  rawScore?: number;
  adjustedScore?: number;
  grade?: string;
  GPAContribution?: number;
  remarks?: string;
  gradedBy?: Types.ObjectId;
  gradingStatus?: ExamGradingStatus;
}

interface ExamModerationUpdateFields {
  moderatorId?: Types.ObjectId;
  findings?: string;
  recommendations?: string;
  status?: CreateExamModerationDto['status'];
  moderatedAt?: Date;
}

interface ExamAttendanceUpdateFields {
  studentId?: Types.ObjectId;
  attendanceStatus?: CreateExamAttendanceDto['attendanceStatus'];
  checkedInAt?: Date;
  verifiedBy?: Types.ObjectId;
}

interface ExamMalpracticeUpdateFields {
  studentId?: Types.ObjectId;
  reportedBy?: Types.ObjectId;
  incidentType?: string;
  description?: string;
  evidenceFiles?: string[];
  actionTaken?: string;
  status?: CreateExamMalpracticeDto['status'];
}

interface ResultAuditSnapshot {
  rawScore: number;
  adjustedScore?: number;
  grade: string;
  GPAContribution?: number;
  remarks?: string;
  gradedBy: string;
  gradingStatus: ExamGradingStatus;
  published: boolean;
  publishedAt?: string;
}

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    @InjectModel(Exam.name)
    private readonly examModel: Model<Exam>,
    @InjectModel(ExamSession.name)
    private readonly examSessionModel: Model<ExamSession>,
    @InjectModel(ExamEligibility.name)
    private readonly examEligibilityModel: Model<ExamEligibility>,
    @InjectModel(ExamQuestion.name)
    private readonly examQuestionModel: Model<ExamQuestion>,
    @InjectModel(ExamAttempt.name)
    private readonly examAttemptModel: Model<ExamAttempt>,
    @InjectModel(ExamSubmission.name)
    private readonly examSubmissionModel: Model<ExamSubmission>,
    @InjectModel(ExamResult.name)
    private readonly examResultModel: Model<ExamResult>,
    @InjectModel(ExamModeration.name)
    private readonly examModerationModel: Model<ExamModeration>,
    @InjectModel(ExamAttendance.name)
    private readonly examAttendanceModel: Model<ExamAttendance>,
    @InjectModel(ExamMalpractice.name)
    private readonly examMalpracticeModel: Model<ExamMalpractice>,
    @InjectModel(ExamPublication.name)
    private readonly examPublicationModel: Model<ExamPublication>,
    @InjectModel(ExamAuditLog.name)
    private readonly examAuditLogModel: Model<ExamAuditLog>,
    @InjectModel(CourseUnit.name)
    private readonly courseUnitModel: Model<CourseUnit>,
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<Semester>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
    @InjectModel(Lecturer.name)
    private readonly lecturerModel: Model<Lecturer>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
  ) {}

  async create(createExamDto: CreateExamDto): Promise<ExamDocument> {
    try {
      const courseUnit = await this.ensureCourseUnitExists(
        createExamDto.courseUnitId,
      );
      const semester = await this.ensureSemesterExists(
        createExamDto.semesterId,
      );
      const creator = await this.ensureUserExists(createExamDto.createdBy);
      const approver = createExamDto.approvedBy
        ? await this.ensureUserExists(createExamDto.approvedBy)
        : undefined;

      this.validateExamRelations(courseUnit, semester);
      this.validateExamMarks(
        createExamDto.totalMarks,
        createExamDto.passingMarks,
      );

      const exam = new this.examModel({
        title: createExamDto.title,
        description: createExamDto.description,
        courseUnitId: courseUnit._id,
        semesterId: semester._id,
        examType: createExamDto.examType,
        totalMarks: createExamDto.totalMarks,
        passingMarks: createExamDto.passingMarks,
        durationMinutes: createExamDto.durationMinutes,
        instructions: createExamDto.instructions,
        examWeightPercentage: createExamDto.examWeightPercentage,
        isPublished: createExamDto.isPublished ?? false,
        requiresApproval: createExamDto.requiresApproval ?? true,
        approvalStatus:
          createExamDto.approvalStatus ?? ExamApprovalStatus.DRAFT,
        createdBy: creator._id,
        approvedBy: approver?._id,
      });

      const savedExam = await exam.save();
      await this.recordAuditLog(creator._id, savedExam._id, 'EXAM_CREATED', {
        title: savedExam.title,
        examType: savedExam.examType,
      });

      return savedExam;
    } catch (error: unknown) {
      this.logger.error('Exam creation failed', error);
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('An exam with similar fields exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<ExamDocument[]> {
    return this.examModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ExamDocument> {
    return this.ensureExamExists(id);
  }

  async update(
    id: string,
    updateExamDto: UpdateExamDto,
  ): Promise<ExamDocument> {
    this.validateObjectId(id);

    try {
      const existingExam = await this.ensureExamExists(id);
      const updateFields = await this.buildExamUpdateFields(updateExamDto);
      const nextCourseUnit =
        updateFields.courseUnitId !== undefined
          ? await this.ensureCourseUnitExists(
              updateFields.courseUnitId.toString(),
            )
          : await this.ensureCourseUnitExists(
              existingExam.courseUnitId.toString(),
            );
      const nextSemester =
        updateFields.semesterId !== undefined
          ? await this.ensureSemesterExists(updateFields.semesterId.toString())
          : await this.ensureSemesterExists(existingExam.semesterId.toString());
      const nextTotalMarks = updateFields.totalMarks ?? existingExam.totalMarks;
      const nextPassingMarks =
        updateFields.passingMarks ?? existingExam.passingMarks;

      this.validateExamRelations(nextCourseUnit, nextSemester);
      this.validateExamMarks(nextTotalMarks, nextPassingMarks);

      const updatedExam = await this.examModel
        .findByIdAndUpdate(id, updateFields, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedExam) {
        throw new NotFoundException(`Exam with id ${id} was not found`);
      }

      await this.recordAuditLog(
        updateExamDto.updatedBy ?? existingExam.createdBy,
        existingExam._id,
        'EXAM_UPDATED',
        { updateFields },
        updateExamDto.ipAddress,
      );

      return updatedExam;
    } catch (error: unknown) {
      this.logger.error(`Exam update failed for ${id}`, error);
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('An exam with similar fields exists');
      }
      throw error;
    }
  }

  async updateApprovalStatus(
    id: string,
    approvalDto: UpdateExamApprovalDto,
  ): Promise<ExamDocument> {
    const exam = await this.ensureExamExists(id);
    const actingUserId =
      approvalDto.userId ?? approvalDto.approvedBy ?? exam.createdBy.toString();

    await this.ensureUserExists(actingUserId);

    if (
      approvalDto.approvalStatus === ExamApprovalStatus.APPROVED &&
      !approvalDto.approvedBy
    ) {
      throw new BadRequestException(
        'approvedBy is required to approve an exam',
      );
    }

    const updateFields: ExamUpdateFields = {
      approvalStatus: approvalDto.approvalStatus,
      isPublished:
        approvalDto.approvalStatus === ExamApprovalStatus.PUBLISHED
          ? true
          : approvalDto.approvalStatus === ExamApprovalStatus.ARCHIVED
            ? false
            : exam.isPublished,
    };

    if (approvalDto.approvedBy) {
      updateFields.approvedBy = (
        await this.ensureUserExists(approvalDto.approvedBy)
      )._id;
    }

    const updatedExam = await this.examModel
      .findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedExam) {
      throw new NotFoundException(`Exam with id ${id} was not found`);
    }

    await this.recordAuditLog(
      actingUserId,
      exam._id,
      'EXAM_APPROVAL_STATUS_CHANGED',
      {
        previousStatus: exam.approvalStatus,
        nextStatus: approvalDto.approvalStatus,
        remarks: approvalDto.remarks,
      },
      approvalDto.ipAddress,
    );

    return updatedExam;
  }

  async remove(
    id: string,
    archiveDto: ArchiveExamDto = {},
  ): Promise<ExamDocument> {
    const exam = await this.ensureExamExists(id);
    const actingUserId = archiveDto.userId ?? exam.createdBy.toString();

    await this.ensureUserExists(actingUserId);

    const archivedExam = await this.examModel
      .findByIdAndUpdate(
        id,
        {
          approvalStatus: ExamApprovalStatus.ARCHIVED,
          isPublished: false,
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!archivedExam) {
      throw new NotFoundException(`Exam with id ${id} was not found`);
    }

    await this.recordAuditLog(
      actingUserId,
      exam._id,
      'EXAM_ARCHIVED',
      { previousStatus: exam.approvalStatus },
      archiveDto.ipAddress,
    );

    return archivedExam;
  }

  async createSession(
    examId: string,
    createSessionDto: CreateExamSessionDto,
  ): Promise<ExamSessionDocument> {
    const exam = await this.ensureExamExists(examId);
    const invigilators = await this.resolveLecturerIds(
      createSessionDto.invigilators ?? [],
    );

    this.validateSessionTime(
      createSessionDto.startTime,
      createSessionDto.endTime,
    );

    const session = new this.examSessionModel({
      examId: exam._id,
      sessionDate: new Date(createSessionDto.sessionDate),
      startTime: createSessionDto.startTime,
      endTime: createSessionDto.endTime,
      room: createSessionDto.room,
      mode: createSessionDto.mode,
      invigilators,
      capacity: createSessionDto.capacity,
      status: createSessionDto.status ?? ExamSessionStatus.SCHEDULED,
    });

    return session.save();
  }

  async findSessionsByExam(examId: string): Promise<ExamSessionDocument[]> {
    await this.ensureExamExists(examId);
    return this.examSessionModel
      .find({ examId })
      .sort({ sessionDate: 1 })
      .exec();
  }

  async findSession(sessionId: string): Promise<ExamSessionDocument> {
    this.validateObjectId(sessionId);

    const session = await this.examSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException(
        `Exam session with id ${sessionId} was not found`,
      );
    }

    return session;
  }

  async updateSession(
    sessionId: string,
    updateSessionDto: UpdateExamSessionDto,
  ): Promise<ExamSessionDocument> {
    const existingSession = await this.findSession(sessionId);
    const updateFields =
      await this.buildExamSessionUpdateFields(updateSessionDto);

    this.validateSessionTime(
      updateFields.startTime ?? existingSession.startTime,
      updateFields.endTime ?? existingSession.endTime,
    );

    const updatedSession = await this.examSessionModel
      .findByIdAndUpdate(sessionId, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedSession) {
      throw new NotFoundException(
        `Exam session with id ${sessionId} was not found`,
      );
    }

    return updatedSession;
  }

  async removeSession(sessionId: string): Promise<ExamSessionDocument> {
    await this.findSession(sessionId);

    const cancelledSession = await this.examSessionModel
      .findByIdAndUpdate(
        sessionId,
        { status: ExamSessionStatus.CANCELLED },
        { new: true, runValidators: true },
      )
      .exec();

    if (!cancelledSession) {
      throw new NotFoundException(
        `Exam session with id ${sessionId} was not found`,
      );
    }

    return cancelledSession;
  }

  async checkEligibility(
    examId: string,
    eligibilityDto: CreateExamEligibilityDto,
  ): Promise<ExamEligibilityDocument> {
    const exam = await this.ensureExamExists(examId);
    const facts = await this.computeEligibilityFacts(exam, eligibilityDto);

    const eligibility = await this.examEligibilityModel
      .findOneAndUpdate(
        { studentId: facts.student._id, examId: exam._id },
        {
          studentId: facts.student._id,
          examId: exam._id,
          attendancePercentage: facts.attendancePercentage,
          feeCleared: facts.feeCleared,
          disciplinaryClearance: facts.disciplinaryClearance,
          registrationValid: facts.registrationValid,
          eligible: facts.eligible,
          remarks: facts.remarks,
          checkedAt: new Date(),
        },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    if (!eligibility) {
      throw new BadRequestException('Exam eligibility could not be recorded');
    }

    return eligibility;
  }

  async findEligibilityByExam(
    examId: string,
  ): Promise<ExamEligibilityDocument[]> {
    await this.ensureExamExists(examId);
    return this.examEligibilityModel.find({ examId }).exec();
  }

  async findEligibility(
    eligibilityId: string,
  ): Promise<ExamEligibilityDocument> {
    this.validateObjectId(eligibilityId);

    const eligibility = await this.examEligibilityModel
      .findById(eligibilityId)
      .exec();

    if (!eligibility) {
      throw new NotFoundException(
        `Exam eligibility with id ${eligibilityId} was not found`,
      );
    }

    return eligibility;
  }

  async updateEligibility(
    eligibilityId: string,
    updateEligibilityDto: UpdateExamEligibilityDto,
  ): Promise<ExamEligibilityDocument> {
    const existingEligibility = await this.findEligibility(eligibilityId);
    const exam = await this.ensureExamExists(
      existingEligibility.examId.toString(),
    );
    const facts = await this.computeEligibilityFacts(exam, {
      studentId:
        updateEligibilityDto.studentId ??
        existingEligibility.studentId.toString(),
      attendancePercentage:
        updateEligibilityDto.attendancePercentage ??
        existingEligibility.attendancePercentage,
      feeCleared:
        updateEligibilityDto.feeCleared ?? existingEligibility.feeCleared,
      disciplinaryClearance:
        updateEligibilityDto.disciplinaryClearance ??
        existingEligibility.disciplinaryClearance,
      remarks: updateEligibilityDto.remarks ?? existingEligibility.remarks,
    });

    const updatedEligibility = await this.examEligibilityModel
      .findByIdAndUpdate(
        eligibilityId,
        {
          studentId: facts.student._id,
          attendancePercentage: facts.attendancePercentage,
          feeCleared: facts.feeCleared,
          disciplinaryClearance: facts.disciplinaryClearance,
          registrationValid: facts.registrationValid,
          eligible: facts.eligible,
          remarks: facts.remarks,
          checkedAt: new Date(),
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedEligibility) {
      throw new NotFoundException(
        `Exam eligibility with id ${eligibilityId} was not found`,
      );
    }

    return updatedEligibility;
  }

  async createQuestion(
    examId: string,
    questionDto: CreateExamQuestionDto,
  ): Promise<ExamQuestionDocument> {
    const exam = await this.ensureExamExists(examId);
    this.validateScoreAgainstExam(questionDto.marks, exam);

    try {
      const question = new this.examQuestionModel({
        examId: exam._id,
        questionText: questionDto.questionText,
        questionType: questionDto.questionType,
        marks: questionDto.marks,
        options: questionDto.options ?? [],
        correctAnswer: questionDto.correctAnswer,
        explanation: questionDto.explanation,
        difficultyLevel: questionDto.difficultyLevel,
        order: questionDto.order,
      });

      return await question.save();
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Question order already exists for this exam',
        );
      }
      throw error;
    }
  }

  async findQuestionsByExam(examId: string): Promise<ExamQuestionDocument[]> {
    await this.ensureExamExists(examId);
    return this.examQuestionModel.find({ examId }).sort({ order: 1 }).exec();
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateExamQuestionDto,
  ): Promise<ExamQuestionDocument> {
    const existingQuestion = await this.findQuestion(questionId);
    const exam = await this.ensureExamExists(
      existingQuestion.examId.toString(),
    );
    const updateFields = this.buildExamQuestionUpdateFields(updateQuestionDto);

    this.validateScoreAgainstExam(
      updateFields.marks ?? existingQuestion.marks,
      exam,
    );

    const updatedQuestion = await this.examQuestionModel
      .findByIdAndUpdate(questionId, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedQuestion) {
      throw new NotFoundException(
        `Exam question with id ${questionId} was not found`,
      );
    }

    return updatedQuestion;
  }

  async removeQuestion(questionId: string): Promise<ExamQuestionDocument> {
    const question = await this.examQuestionModel
      .findByIdAndDelete(questionId)
      .exec();

    if (!question) {
      throw new NotFoundException(
        `Exam question with id ${questionId} was not found`,
      );
    }

    return question;
  }

  async createAttempt(
    examId: string,
    attemptDto: CreateExamAttemptDto,
  ): Promise<ExamAttemptDocument> {
    const exam = await this.ensureExamExists(examId);
    const student = await this.ensureStudentExists(attemptDto.studentId);
    const session = await this.findSession(attemptDto.examSessionId);

    this.validateSessionBelongsToExam(session, exam._id);
    await this.ensureStudentEligible(student._id, exam._id);

    const attemptNumber =
      attemptDto.attemptNumber ??
      (await this.examAttemptModel.countDocuments({
        studentId: student._id,
        examId: exam._id,
      })) + 1;

    try {
      const attempt = new this.examAttemptModel({
        studentId: student._id,
        examId: exam._id,
        examSessionId: session._id,
        status: attemptDto.status ?? ExamAttemptStatus.NOT_STARTED,
        attemptNumber,
        ipAddress: attemptDto.ipAddress,
        deviceMetadata: attemptDto.deviceMetadata,
      });

      return await attempt.save();
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Attempt number already exists for this student and exam',
        );
      }
      throw error;
    }
  }

  async findAttemptsByExam(examId: string): Promise<ExamAttemptDocument[]> {
    await this.ensureExamExists(examId);
    return this.examAttemptModel.find({ examId }).exec();
  }

  async findAttempt(attemptId: string): Promise<ExamAttemptDocument> {
    this.validateObjectId(attemptId);

    const attempt = await this.examAttemptModel.findById(attemptId).exec();

    if (!attempt) {
      throw new NotFoundException(
        `Exam attempt with id ${attemptId} was not found`,
      );
    }

    return attempt;
  }

  async startAttempt(
    attemptId: string,
    startDto: StartExamAttemptDto,
  ): Promise<ExamAttemptDocument> {
    const attempt = await this.findAttempt(attemptId);

    if (
      [
        ExamAttemptStatus.SUBMITTED,
        ExamAttemptStatus.AUTO_SUBMITTED,
        ExamAttemptStatus.DISQUALIFIED,
      ].includes(attempt.status)
    ) {
      throw new ConflictException('This exam attempt cannot be started');
    }

    const updatedAttempt = await this.examAttemptModel
      .findByIdAndUpdate(
        attemptId,
        {
          startedAt: attempt.startedAt ?? new Date(),
          status: ExamAttemptStatus.IN_PROGRESS,
          ipAddress: startDto.ipAddress ?? attempt.ipAddress,
          deviceMetadata: startDto.deviceMetadata ?? attempt.deviceMetadata,
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedAttempt) {
      throw new NotFoundException(
        `Exam attempt with id ${attemptId} was not found`,
      );
    }

    const student = await this.ensureStudentExists(
      attempt.studentId.toString(),
    );
    await this.recordAuditLog(
      student.userId,
      attempt.examId,
      'EXAM_ATTEMPT_STARTED',
      { attemptId },
      startDto.ipAddress,
    );

    return updatedAttempt;
  }

  async autoSaveSubmission(
    attemptId: string,
    autoSaveDto: AutoSaveExamSubmissionDto,
  ): Promise<ExamSubmissionDocument> {
    const attempt = await this.findAttempt(attemptId);
    this.validateAttemptAcceptsSubmission(attempt);

    const responses = await this.buildSubmissionResponses(
      attempt.examId,
      autoSaveDto.responses,
    );
    const submission = await this.examSubmissionModel
      .findOneAndUpdate(
        { examAttemptId: attempt._id },
        {
          examAttemptId: attempt._id,
          studentId: attempt.studentId,
          responses,
          attachments: autoSaveDto.attachments ?? [],
          autoSavedAt: new Date(),
        },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    if (!submission) {
      throw new BadRequestException('Exam submission could not be auto-saved');
    }

    return submission;
  }

  async submitAttempt(
    attemptId: string,
    submitDto: SubmitExamSubmissionDto,
  ): Promise<ExamSubmissionDocument> {
    const attempt = await this.findAttempt(attemptId);
    this.validateAttemptAcceptsSubmission(attempt);

    const submittedAt = submitDto.submittedAt
      ? new Date(submitDto.submittedAt)
      : new Date();
    const responses = await this.buildSubmissionResponses(
      attempt.examId,
      submitDto.responses,
    );
    const submission = await this.examSubmissionModel
      .findOneAndUpdate(
        { examAttemptId: attempt._id },
        {
          examAttemptId: attempt._id,
          studentId: attempt.studentId,
          responses,
          attachments: submitDto.attachments ?? [],
          submittedAt,
          autoSavedAt: submittedAt,
        },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    if (!submission) {
      throw new BadRequestException('Exam submission could not be saved');
    }

    await this.examAttemptModel
      .findByIdAndUpdate(
        attemptId,
        {
          status: ExamAttemptStatus.SUBMITTED,
          submittedAt,
          durationSpent: submitDto.durationSpent,
        },
        { runValidators: true },
      )
      .exec();

    const student = await this.ensureStudentExists(
      attempt.studentId.toString(),
    );
    await this.recordAuditLog(
      student.userId,
      attempt.examId,
      'EXAM_SUBMITTED',
      {
        attemptId,
        submittedAt,
      },
    );

    return submission;
  }

  async findSubmission(submissionId: string): Promise<ExamSubmissionDocument> {
    this.validateObjectId(submissionId);

    const submission = await this.examSubmissionModel
      .findById(submissionId)
      .exec();

    if (!submission) {
      throw new NotFoundException(
        `Exam submission with id ${submissionId} was not found`,
      );
    }

    return submission;
  }

  async findSubmissionByAttempt(
    attemptId: string,
  ): Promise<ExamSubmissionDocument> {
    const attempt = await this.findAttempt(attemptId);
    const submission = await this.examSubmissionModel
      .findOne({ examAttemptId: attempt._id })
      .exec();

    if (!submission) {
      throw new NotFoundException(
        `Exam submission for attempt ${attemptId} was not found`,
      );
    }

    return submission;
  }

  async createResult(
    examId: string,
    resultDto: CreateExamResultDto,
  ): Promise<ExamResultDocument> {
    const exam = await this.ensureExamExists(examId);
    const student = await this.ensureStudentExists(resultDto.studentId);
    const lecturer = await this.ensureLecturerExists(resultDto.gradedBy);

    this.validateResultScores(resultDto, exam);

    try {
      const result = new this.examResultModel({
        studentId: student._id,
        examId: exam._id,
        courseUnitId: exam.courseUnitId,
        rawScore: resultDto.rawScore,
        adjustedScore: resultDto.adjustedScore,
        grade: resultDto.grade,
        GPAContribution: resultDto.GPAContribution,
        remarks: resultDto.remarks,
        gradedBy: lecturer._id,
        gradingStatus: resultDto.gradingStatus ?? ExamGradingStatus.GRADED,
        published: false,
      });

      const savedResult = await result.save();
      await this.recordAuditLog(lecturer.userId, exam._id, 'RESULT_CREATED', {
        resultId: savedResult._id,
        studentId: student._id,
        rawScore: savedResult.rawScore,
        grade: savedResult.grade,
      });

      return savedResult;
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A result for this student and exam already exists',
        );
      }
      throw error;
    }
  }

  async findResultsByExam(examId: string): Promise<ExamResultDocument[]> {
    await this.ensureExamExists(examId);
    return this.examResultModel.find({ examId }).exec();
  }

  async findResult(resultId: string): Promise<ExamResultDocument> {
    this.validateObjectId(resultId);

    const result = await this.examResultModel.findById(resultId).exec();

    if (!result) {
      throw new NotFoundException(
        `Exam result with id ${resultId} was not found`,
      );
    }

    return result;
  }

  async updateResult(
    resultId: string,
    updateResultDto: UpdateExamResultDto,
  ): Promise<ExamResultDocument> {
    const existingResult = await this.findResult(resultId);
    const modifier = await this.ensureUserExists(updateResultDto.modifiedBy);
    const exam = await this.ensureExamExists(existingResult.examId.toString());
    const updateFields =
      await this.buildExamResultUpdateFields(updateResultDto);

    this.validateResultScores(
      {
        rawScore: updateFields.rawScore ?? existingResult.rawScore,
        adjustedScore:
          updateFields.adjustedScore ?? existingResult.adjustedScore,
      },
      exam,
    );

    const previousValues = this.toResultAuditSnapshot(existingResult);
    const updatedResult = await this.examResultModel
      .findByIdAndUpdate(resultId, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedResult) {
      throw new NotFoundException(
        `Exam result with id ${resultId} was not found`,
      );
    }

    await this.recordAuditLog(
      modifier._id,
      existingResult.examId,
      'RESULT_UPDATED',
      {
        resultId,
        previousValues,
        nextValues: this.toResultAuditSnapshot(updatedResult),
      },
      updateResultDto.ipAddress,
    );

    return updatedResult;
  }

  async createModeration(
    examId: string,
    moderationDto: CreateExamModerationDto,
  ): Promise<ExamModerationDocument> {
    const exam = await this.ensureExamExists(examId);
    const moderator = await this.ensureLecturerExists(
      moderationDto.moderatorId,
    );
    const moderation = new this.examModerationModel({
      examId: exam._id,
      moderatorId: moderator._id,
      findings: moderationDto.findings,
      recommendations: moderationDto.recommendations,
      status: moderationDto.status,
      moderatedAt: new Date(),
    });

    const savedModeration = await moderation.save();

    if (savedModeration.status === ExamModerationStatus.APPROVED) {
      await this.examResultModel
        .updateMany(
          { examId: exam._id, gradingStatus: ExamGradingStatus.GRADED },
          { gradingStatus: ExamGradingStatus.MODERATED },
          { runValidators: true },
        )
        .exec();
    }

    await this.recordAuditLog(moderator.userId, exam._id, 'EXAM_MODERATED', {
      moderationId: savedModeration._id,
      status: savedModeration.status,
    });

    return savedModeration;
  }

  async findModerationsByExam(
    examId: string,
  ): Promise<ExamModerationDocument[]> {
    await this.ensureExamExists(examId);
    return this.examModerationModel.find({ examId }).exec();
  }

  async findModeration(moderationId: string): Promise<ExamModerationDocument> {
    this.validateObjectId(moderationId);

    const moderation = await this.examModerationModel
      .findById(moderationId)
      .exec();

    if (!moderation) {
      throw new NotFoundException(
        `Exam moderation with id ${moderationId} was not found`,
      );
    }

    return moderation;
  }

  async updateModeration(
    moderationId: string,
    updateModerationDto: UpdateExamModerationDto,
  ): Promise<ExamModerationDocument> {
    await this.findModeration(moderationId);

    const updateFields =
      await this.buildExamModerationUpdateFields(updateModerationDto);
    const updatedModeration = await this.examModerationModel
      .findByIdAndUpdate(moderationId, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedModeration) {
      throw new NotFoundException(
        `Exam moderation with id ${moderationId} was not found`,
      );
    }

    return updatedModeration;
  }

  async recordAttendance(
    sessionId: string,
    attendanceDto: CreateExamAttendanceDto,
  ): Promise<ExamAttendanceDocument> {
    const session = await this.findSession(sessionId);
    const student = await this.ensureStudentExists(attendanceDto.studentId);
    const verifier = await this.ensureUserExists(attendanceDto.verifiedBy);

    try {
      const attendance = new this.examAttendanceModel({
        studentId: student._id,
        examSessionId: session._id,
        attendanceStatus: attendanceDto.attendanceStatus,
        checkedInAt: attendanceDto.checkedInAt
          ? new Date(attendanceDto.checkedInAt)
          : undefined,
        verifiedBy: verifier._id,
      });

      return await attendance.save();
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Attendance has already been recorded for this student and session',
        );
      }
      throw error;
    }
  }

  async findAttendanceBySession(
    sessionId: string,
  ): Promise<ExamAttendanceDocument[]> {
    await this.findSession(sessionId);
    return this.examAttendanceModel.find({ examSessionId: sessionId }).exec();
  }

  async findAttendance(attendanceId: string): Promise<ExamAttendanceDocument> {
    this.validateObjectId(attendanceId);

    const attendance = await this.examAttendanceModel
      .findById(attendanceId)
      .exec();

    if (!attendance) {
      throw new NotFoundException(
        `Exam attendance with id ${attendanceId} was not found`,
      );
    }

    return attendance;
  }

  async updateAttendance(
    attendanceId: string,
    updateAttendanceDto: UpdateExamAttendanceDto,
  ): Promise<ExamAttendanceDocument> {
    await this.findAttendance(attendanceId);

    const updateFields =
      await this.buildExamAttendanceUpdateFields(updateAttendanceDto);
    const updatedAttendance = await this.examAttendanceModel
      .findByIdAndUpdate(attendanceId, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedAttendance) {
      throw new NotFoundException(
        `Exam attendance with id ${attendanceId} was not found`,
      );
    }

    return updatedAttendance;
  }

  async createMalpractice(
    examId: string,
    malpracticeDto: CreateExamMalpracticeDto,
  ): Promise<ExamMalpracticeDocument> {
    const exam = await this.ensureExamExists(examId);
    const student = await this.ensureStudentExists(malpracticeDto.studentId);
    const reporter = await this.ensureUserExists(malpracticeDto.reportedBy);
    const malpractice = new this.examMalpracticeModel({
      studentId: student._id,
      examId: exam._id,
      reportedBy: reporter._id,
      incidentType: malpracticeDto.incidentType,
      description: malpracticeDto.description,
      evidenceFiles: malpracticeDto.evidenceFiles ?? [],
      actionTaken: malpracticeDto.actionTaken,
      status: malpracticeDto.status ?? ExamMalpracticeStatus.UNDER_REVIEW,
    });

    const savedMalpractice = await malpractice.save();
    await this.recordAuditLog(reporter._id, exam._id, 'MALPRACTICE_REPORTED', {
      malpracticeId: savedMalpractice._id,
      studentId: student._id,
      status: savedMalpractice.status,
    });

    return savedMalpractice;
  }

  async findMalpracticeByExam(
    examId: string,
  ): Promise<ExamMalpracticeDocument[]> {
    await this.ensureExamExists(examId);
    return this.examMalpracticeModel.find({ examId }).exec();
  }

  async updateMalpractice(
    malpracticeId: string,
    updateMalpracticeDto: UpdateExamMalpracticeDto,
  ): Promise<ExamMalpracticeDocument> {
    const existingMalpractice = await this.findMalpractice(malpracticeId);
    const updater = await this.ensureUserExists(updateMalpracticeDto.updatedBy);
    const updateFields =
      await this.buildExamMalpracticeUpdateFields(updateMalpracticeDto);
    const updatedMalpractice = await this.examMalpracticeModel
      .findByIdAndUpdate(malpracticeId, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedMalpractice) {
      throw new NotFoundException(
        `Exam malpractice with id ${malpracticeId} was not found`,
      );
    }

    await this.recordAuditLog(
      updater._id,
      existingMalpractice.examId,
      'MALPRACTICE_UPDATED',
      {
        malpracticeId,
        previousStatus: existingMalpractice.status,
        nextStatus: updatedMalpractice.status,
      },
      updateMalpracticeDto.ipAddress,
    );

    return updatedMalpractice;
  }

  removeMalpractice(malpracticeId: string): never {
    void malpracticeId;
    throw new ConflictException('Malpractice records cannot be deleted');
  }

  async publishResults(
    examId: string,
    publishDto: PublishExamResultsDto,
  ): Promise<ExamPublicationDocument> {
    const exam = await this.ensureExamExists(examId);
    const publisher = await this.ensureUserExists(publishDto.publishedBy);

    if (
      exam.requiresApproval &&
      ![ExamApprovalStatus.APPROVED, ExamApprovalStatus.PUBLISHED].includes(
        exam.approvalStatus,
      )
    ) {
      throw new ConflictException('Exam must be approved before publication');
    }

    const resultCount = await this.examResultModel
      .countDocuments({ examId: exam._id })
      .exec();
    const unapprovedCount = await this.examResultModel
      .countDocuments({
        examId: exam._id,
        gradingStatus: {
          $nin: [ExamGradingStatus.APPROVED, ExamGradingStatus.PUBLISHED],
        },
      })
      .exec();

    if (resultCount === 0) {
      throw new ConflictException('No results are available for publication');
    }

    if (unapprovedCount > 0) {
      throw new ConflictException(
        'All exam results must be approved before publication',
      );
    }

    const publicationDate = new Date();
    const publication = new this.examPublicationModel({
      examId: exam._id,
      publishedBy: publisher._id,
      publicationDate,
      visibility: publishDto.visibility,
      notificationSent: publishDto.notificationSent ?? false,
    });
    const savedPublication = await publication.save();

    await this.examResultModel
      .updateMany(
        { examId: exam._id },
        {
          published: true,
          publishedAt: publicationDate,
          gradingStatus: ExamGradingStatus.PUBLISHED,
        },
        { runValidators: true },
      )
      .exec();
    await this.examModel
      .findByIdAndUpdate(
        exam._id,
        {
          isPublished: true,
          approvalStatus: ExamApprovalStatus.PUBLISHED,
        },
        { runValidators: true },
      )
      .exec();

    await this.recordAuditLog(
      publisher._id,
      exam._id,
      'RESULTS_PUBLISHED',
      {
        publicationId: savedPublication._id,
        resultCount,
        visibility: publishDto.visibility,
      },
      publishDto.ipAddress,
    );

    return savedPublication;
  }

  async findPublicationsByExam(
    examId: string,
  ): Promise<ExamPublicationDocument[]> {
    await this.ensureExamExists(examId);
    return this.examPublicationModel.find({ examId }).exec();
  }

  async findPublication(
    publicationId: string,
  ): Promise<ExamPublicationDocument> {
    this.validateObjectId(publicationId);

    const publication = await this.examPublicationModel
      .findById(publicationId)
      .exec();

    if (!publication) {
      throw new NotFoundException(
        `Exam publication with id ${publicationId} was not found`,
      );
    }

    return publication;
  }

  async findAuditLogsByExam(examId: string): Promise<ExamAuditLogDocument[]> {
    await this.ensureExamExists(examId);
    return this.examAuditLogModel
      .find({ examId })
      .sort({ createdAt: -1 })
      .exec();
  }

  private async buildExamUpdateFields(
    updateExamDto: UpdateExamDto,
  ): Promise<ExamUpdateFields> {
    const updateFields: ExamUpdateFields = {};

    if (updateExamDto.title !== undefined) {
      updateFields.title = updateExamDto.title;
    }

    if (updateExamDto.description !== undefined) {
      updateFields.description = updateExamDto.description;
    }

    if (updateExamDto.courseUnitId !== undefined) {
      updateFields.courseUnitId = (
        await this.ensureCourseUnitExists(updateExamDto.courseUnitId)
      )._id;
    }

    if (updateExamDto.semesterId !== undefined) {
      updateFields.semesterId = (
        await this.ensureSemesterExists(updateExamDto.semesterId)
      )._id;
    }

    if (updateExamDto.examType !== undefined) {
      updateFields.examType = updateExamDto.examType;
    }

    if (updateExamDto.totalMarks !== undefined) {
      updateFields.totalMarks = updateExamDto.totalMarks;
    }

    if (updateExamDto.passingMarks !== undefined) {
      updateFields.passingMarks = updateExamDto.passingMarks;
    }

    if (updateExamDto.durationMinutes !== undefined) {
      updateFields.durationMinutes = updateExamDto.durationMinutes;
    }

    if (updateExamDto.instructions !== undefined) {
      updateFields.instructions = updateExamDto.instructions;
    }

    if (updateExamDto.examWeightPercentage !== undefined) {
      updateFields.examWeightPercentage = updateExamDto.examWeightPercentage;
    }

    if (updateExamDto.isPublished !== undefined) {
      updateFields.isPublished = updateExamDto.isPublished;
    }

    if (updateExamDto.requiresApproval !== undefined) {
      updateFields.requiresApproval = updateExamDto.requiresApproval;
    }

    if (updateExamDto.approvalStatus !== undefined) {
      updateFields.approvalStatus = updateExamDto.approvalStatus;
    }

    if (updateExamDto.createdBy !== undefined) {
      updateFields.createdBy = (
        await this.ensureUserExists(updateExamDto.createdBy)
      )._id;
    }

    if (updateExamDto.approvedBy !== undefined) {
      updateFields.approvedBy = (
        await this.ensureUserExists(updateExamDto.approvedBy)
      )._id;
    }

    return updateFields;
  }

  private async buildExamSessionUpdateFields(
    updateSessionDto: UpdateExamSessionDto,
  ): Promise<ExamSessionUpdateFields> {
    const updateFields: ExamSessionUpdateFields = {};

    if (updateSessionDto.sessionDate !== undefined) {
      updateFields.sessionDate = new Date(updateSessionDto.sessionDate);
    }

    if (updateSessionDto.startTime !== undefined) {
      updateFields.startTime = updateSessionDto.startTime;
    }

    if (updateSessionDto.endTime !== undefined) {
      updateFields.endTime = updateSessionDto.endTime;
    }

    if (updateSessionDto.room !== undefined) {
      updateFields.room = updateSessionDto.room;
    }

    if (updateSessionDto.mode !== undefined) {
      updateFields.mode = updateSessionDto.mode;
    }

    if (updateSessionDto.invigilators !== undefined) {
      updateFields.invigilators = await this.resolveLecturerIds(
        updateSessionDto.invigilators,
      );
    }

    if (updateSessionDto.capacity !== undefined) {
      updateFields.capacity = updateSessionDto.capacity;
    }

    if (updateSessionDto.status !== undefined) {
      updateFields.status = updateSessionDto.status;
    }

    return updateFields;
  }

  private buildExamQuestionUpdateFields(
    updateQuestionDto: UpdateExamQuestionDto,
  ): ExamQuestionUpdateFields {
    const updateFields: ExamQuestionUpdateFields = {};

    if (updateQuestionDto.questionText !== undefined) {
      updateFields.questionText = updateQuestionDto.questionText;
    }

    if (updateQuestionDto.questionType !== undefined) {
      updateFields.questionType = updateQuestionDto.questionType;
    }

    if (updateQuestionDto.marks !== undefined) {
      updateFields.marks = updateQuestionDto.marks;
    }

    if (updateQuestionDto.options !== undefined) {
      updateFields.options = updateQuestionDto.options;
    }

    if (updateQuestionDto.correctAnswer !== undefined) {
      updateFields.correctAnswer = updateQuestionDto.correctAnswer;
    }

    if (updateQuestionDto.explanation !== undefined) {
      updateFields.explanation = updateQuestionDto.explanation;
    }

    if (updateQuestionDto.difficultyLevel !== undefined) {
      updateFields.difficultyLevel = updateQuestionDto.difficultyLevel;
    }

    if (updateQuestionDto.order !== undefined) {
      updateFields.order = updateQuestionDto.order;
    }

    return updateFields;
  }

  private async buildExamResultUpdateFields(
    updateResultDto: UpdateExamResultDto,
  ): Promise<ExamResultUpdateFields> {
    const updateFields: ExamResultUpdateFields = {};

    if (updateResultDto.studentId !== undefined) {
      updateFields.studentId = (
        await this.ensureStudentExists(updateResultDto.studentId)
      )._id;
    }

    if (updateResultDto.rawScore !== undefined) {
      updateFields.rawScore = updateResultDto.rawScore;
    }

    if (updateResultDto.adjustedScore !== undefined) {
      updateFields.adjustedScore = updateResultDto.adjustedScore;
    }

    if (updateResultDto.grade !== undefined) {
      updateFields.grade = updateResultDto.grade;
    }

    if (updateResultDto.GPAContribution !== undefined) {
      updateFields.GPAContribution = updateResultDto.GPAContribution;
    }

    if (updateResultDto.remarks !== undefined) {
      updateFields.remarks = updateResultDto.remarks;
    }

    if (updateResultDto.gradedBy !== undefined) {
      updateFields.gradedBy = (
        await this.ensureLecturerExists(updateResultDto.gradedBy)
      )._id;
    }

    if (updateResultDto.gradingStatus !== undefined) {
      updateFields.gradingStatus = updateResultDto.gradingStatus;
    }

    return updateFields;
  }

  private async buildExamModerationUpdateFields(
    updateModerationDto: UpdateExamModerationDto,
  ): Promise<ExamModerationUpdateFields> {
    const updateFields: ExamModerationUpdateFields = {};

    if (updateModerationDto.moderatorId !== undefined) {
      updateFields.moderatorId = (
        await this.ensureLecturerExists(updateModerationDto.moderatorId)
      )._id;
    }

    if (updateModerationDto.findings !== undefined) {
      updateFields.findings = updateModerationDto.findings;
    }

    if (updateModerationDto.recommendations !== undefined) {
      updateFields.recommendations = updateModerationDto.recommendations;
    }

    if (updateModerationDto.status !== undefined) {
      updateFields.status = updateModerationDto.status;
      updateFields.moderatedAt = new Date();
    }

    return updateFields;
  }

  private async buildExamAttendanceUpdateFields(
    updateAttendanceDto: UpdateExamAttendanceDto,
  ): Promise<ExamAttendanceUpdateFields> {
    const updateFields: ExamAttendanceUpdateFields = {};

    if (updateAttendanceDto.studentId !== undefined) {
      updateFields.studentId = (
        await this.ensureStudentExists(updateAttendanceDto.studentId)
      )._id;
    }

    if (updateAttendanceDto.attendanceStatus !== undefined) {
      updateFields.attendanceStatus = updateAttendanceDto.attendanceStatus;
    }

    if (updateAttendanceDto.checkedInAt !== undefined) {
      updateFields.checkedInAt = new Date(updateAttendanceDto.checkedInAt);
    }

    if (updateAttendanceDto.verifiedBy !== undefined) {
      updateFields.verifiedBy = (
        await this.ensureUserExists(updateAttendanceDto.verifiedBy)
      )._id;
    }

    return updateFields;
  }

  private async buildExamMalpracticeUpdateFields(
    updateMalpracticeDto: UpdateExamMalpracticeDto,
  ): Promise<ExamMalpracticeUpdateFields> {
    const updateFields: ExamMalpracticeUpdateFields = {};

    if (updateMalpracticeDto.studentId !== undefined) {
      updateFields.studentId = (
        await this.ensureStudentExists(updateMalpracticeDto.studentId)
      )._id;
    }

    if (updateMalpracticeDto.reportedBy !== undefined) {
      updateFields.reportedBy = (
        await this.ensureUserExists(updateMalpracticeDto.reportedBy)
      )._id;
    }

    if (updateMalpracticeDto.incidentType !== undefined) {
      updateFields.incidentType = updateMalpracticeDto.incidentType;
    }

    if (updateMalpracticeDto.description !== undefined) {
      updateFields.description = updateMalpracticeDto.description;
    }

    if (updateMalpracticeDto.evidenceFiles !== undefined) {
      updateFields.evidenceFiles = updateMalpracticeDto.evidenceFiles;
    }

    if (updateMalpracticeDto.actionTaken !== undefined) {
      updateFields.actionTaken = updateMalpracticeDto.actionTaken;
    }

    if (updateMalpracticeDto.status !== undefined) {
      updateFields.status = updateMalpracticeDto.status;
    }

    return updateFields;
  }

  private async computeEligibilityFacts(
    exam: ExamDocument,
    eligibilityDto: EligibilityComputationInput,
  ): Promise<EligibilityFacts> {
    const student = await this.ensureStudentExists(eligibilityDto.studentId);
    const [attendancePercentage, registrationValid] = await Promise.all([
      this.calculateAttendancePercentage(exam, student._id, eligibilityDto),
      this.isRegistrationValid(exam, student._id),
    ]);
    const eligible =
      attendancePercentage >= EXAM_ATTENDANCE_THRESHOLD_PERCENTAGE &&
      eligibilityDto.feeCleared &&
      eligibilityDto.disciplinaryClearance &&
      registrationValid;

    return {
      student,
      attendancePercentage,
      feeCleared: eligibilityDto.feeCleared,
      disciplinaryClearance: eligibilityDto.disciplinaryClearance,
      registrationValid,
      eligible,
      remarks:
        eligibilityDto.remarks ??
        this.buildEligibilityRemarks({
          attendancePercentage,
          feeCleared: eligibilityDto.feeCleared,
          disciplinaryClearance: eligibilityDto.disciplinaryClearance,
          registrationValid,
          eligible,
        }),
    };
  }

  private async calculateAttendancePercentage(
    exam: ExamDocument,
    studentId: Types.ObjectId,
    eligibilityDto: Pick<CreateExamEligibilityDto, 'attendancePercentage'>,
  ): Promise<number> {
    const attendanceRecords = await this.attendanceModel
      .find({ studentId, courseUnitId: exam.courseUnitId })
      .exec();

    if (attendanceRecords.length === 0) {
      return eligibilityDto.attendancePercentage;
    }

    const attendedCount = attendanceRecords.filter((record) =>
      [AttendanceStatus.PRESENT, AttendanceStatus.LATE].includes(record.status),
    ).length;

    return Number(
      ((attendedCount / attendanceRecords.length) * 100).toFixed(2),
    );
  }

  private async isRegistrationValid(
    exam: ExamDocument,
    studentId: Types.ObjectId,
  ): Promise<boolean> {
    const enrollment = await this.enrollmentModel
      .findOne({
        studentId,
        courseUnitId: exam.courseUnitId,
        semesterId: exam.semesterId,
        status: EnrollmentStatus.ACTIVE,
      })
      .exec();

    return Boolean(enrollment);
  }

  private buildEligibilityRemarks(
    facts: Omit<EligibilityFacts, 'student' | 'remarks'>,
  ): string {
    if (facts.eligible) {
      return 'Eligible';
    }

    const reasons: string[] = [];

    if (facts.attendancePercentage < EXAM_ATTENDANCE_THRESHOLD_PERCENTAGE) {
      reasons.push('attendance below threshold');
    }

    if (!facts.feeCleared) {
      reasons.push('fees not cleared');
    }

    if (!facts.disciplinaryClearance) {
      reasons.push('disciplinary clearance missing');
    }

    if (!facts.registrationValid) {
      reasons.push('registration is not valid');
    }

    return `Not eligible: ${reasons.join(', ')}`;
  }

  private async buildSubmissionResponses(
    examId: Types.ObjectId,
    responses: ExamSubmissionResponseDto[],
  ): Promise<ExamResponse[]> {
    const questionIds = responses.map((response) => response.questionId);
    questionIds.forEach((questionId) => this.validateObjectId(questionId));

    if (new Set(questionIds).size !== questionIds.length) {
      throw new BadRequestException(
        'Duplicate question responses are not allowed',
      );
    }

    const questionObjectIds = questionIds.map(
      (questionId) => new Types.ObjectId(questionId),
    );
    const questionCount = await this.examQuestionModel
      .countDocuments({ _id: { $in: questionObjectIds }, examId })
      .exec();

    if (questionCount !== questionObjectIds.length) {
      throw new BadRequestException(
        'All responses must reference questions for the attempt exam',
      );
    }

    return responses.map((response) => ({
      questionId: new Types.ObjectId(response.questionId),
      answer: response.answer,
      marksAwarded: response.marksAwarded,
      feedback: response.feedback,
    }));
  }

  private validateAttemptAcceptsSubmission(attempt: ExamAttemptDocument): void {
    if (
      [
        ExamAttemptStatus.SUBMITTED,
        ExamAttemptStatus.AUTO_SUBMITTED,
        ExamAttemptStatus.DISQUALIFIED,
      ].includes(attempt.status)
    ) {
      throw new ConflictException('This attempt no longer accepts submissions');
    }
  }

  private async ensureStudentEligible(
    studentId: Types.ObjectId,
    examId: Types.ObjectId,
  ): Promise<void> {
    const eligibility = await this.examEligibilityModel
      .findOne({ studentId, examId })
      .exec();

    if (!eligibility || !eligibility.eligible) {
      throw new ConflictException('Student is not eligible to sit this exam');
    }
  }

  private validateSessionBelongsToExam(
    session: ExamSessionDocument,
    examId: Types.ObjectId,
  ): void {
    if (!session.examId.equals(examId)) {
      throw new ConflictException('Exam session does not belong to this exam');
    }

    if (
      [ExamSessionStatus.CANCELLED, ExamSessionStatus.POSTPONED].includes(
        session.status,
      )
    ) {
      throw new ConflictException('Exam session is not open for attempts');
    }
  }

  private validateExamMarks(totalMarks: number, passingMarks: number): void {
    if (passingMarks > totalMarks) {
      throw new BadRequestException(
        'Passing marks cannot be greater than total marks',
      );
    }
  }

  private validateExamRelations(
    courseUnit: CourseUnitDocument,
    semester: SemesterDocument,
  ): void {
    if (!courseUnit.semesterId.equals(semester._id)) {
      throw new ConflictException(
        'Exam semester must match the course unit semester',
      );
    }
  }

  private validateSessionTime(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException(
        'Exam session endTime must be after startTime',
      );
    }
  }

  private validateScoreAgainstExam(score: number, exam: ExamDocument): void {
    if (score > exam.totalMarks) {
      throw new BadRequestException('Marks cannot exceed exam total marks');
    }
  }

  private validateResultScores(
    scoreDto: Pick<CreateExamResultDto, 'rawScore' | 'adjustedScore'>,
    exam: ExamDocument,
  ): void {
    this.validateScoreAgainstExam(scoreDto.rawScore, exam);

    if (
      scoreDto.adjustedScore !== undefined &&
      scoreDto.adjustedScore > exam.totalMarks
    ) {
      throw new BadRequestException(
        'Adjusted score cannot exceed exam total marks',
      );
    }
  }

  private toResultAuditSnapshot(
    result: ExamResultDocument,
  ): ResultAuditSnapshot {
    return {
      rawScore: result.rawScore,
      adjustedScore: result.adjustedScore,
      grade: result.grade,
      GPAContribution: result.GPAContribution,
      remarks: result.remarks,
      gradedBy: result.gradedBy.toString(),
      gradingStatus: result.gradingStatus,
      published: result.published,
      publishedAt: result.publishedAt?.toISOString(),
    };
  }

  async findQuestion(questionId: string): Promise<ExamQuestionDocument> {
    this.validateObjectId(questionId);

    const question = await this.examQuestionModel.findById(questionId).exec();

    if (!question) {
      throw new NotFoundException(
        `Exam question with id ${questionId} was not found`,
      );
    }

    return question;
  }

  async findMalpractice(
    malpracticeId: string,
  ): Promise<ExamMalpracticeDocument> {
    this.validateObjectId(malpracticeId);

    const malpractice = await this.examMalpracticeModel
      .findById(malpracticeId)
      .exec();

    if (!malpractice) {
      throw new NotFoundException(
        `Exam malpractice with id ${malpracticeId} was not found`,
      );
    }

    return malpractice;
  }

  private async resolveLecturerIds(
    lecturerIds: string[],
  ): Promise<Types.ObjectId[]> {
    return Promise.all(
      lecturerIds.map(async (lecturerId) => {
        const lecturer = await this.ensureLecturerExists(lecturerId);
        return lecturer._id;
      }),
    );
  }

  private async ensureExamExists(id: string): Promise<ExamDocument> {
    this.validateObjectId(id);

    const exam = await this.examModel.findById(id).exec();

    if (!exam) {
      throw new NotFoundException(`Exam with id ${id} was not found`);
    }

    return exam;
  }

  private async ensureCourseUnitExists(
    id: string,
  ): Promise<CourseUnitDocument> {
    this.validateObjectId(id);

    const courseUnit = await this.courseUnitModel.findById(id).exec();

    if (!courseUnit) {
      throw new NotFoundException(`Course unit with id ${id} was not found`);
    }

    return courseUnit;
  }

  private async ensureSemesterExists(id: string): Promise<SemesterDocument> {
    this.validateObjectId(id);

    const semester = await this.semesterModel.findById(id).exec();

    if (!semester) {
      throw new NotFoundException(`Semester with id ${id} was not found`);
    }

    return semester;
  }

  private async ensureStudentExists(id: string): Promise<StudentDocument> {
    this.validateObjectId(id);

    const student = await this.studentModel.findById(id).exec();

    if (!student) {
      throw new NotFoundException(`Student with id ${id} was not found`);
    }

    return student;
  }

  private async ensureLecturerExists(id: string): Promise<LecturerDocument> {
    this.validateObjectId(id);

    const lecturer = await this.lecturerModel.findById(id).exec();

    if (!lecturer) {
      throw new NotFoundException(`Lecturer with id ${id} was not found`);
    }

    return lecturer;
  }

  private async ensureUserExists(
    id: string | Types.ObjectId,
  ): Promise<UserDocument> {
    const userId = id.toString();
    this.validateObjectId(userId);

    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException(`User with id ${userId} was not found`);
    }

    return user;
  }

  private async recordAuditLog(
    userId: string | Types.ObjectId,
    examId: string | Types.ObjectId,
    action: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<ExamAuditLogDocument> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const examObjectId = new Types.ObjectId(examId.toString());
    const auditLog = new this.examAuditLogModel({
      userId: userObjectId,
      examId: examObjectId,
      action,
      metadata,
      ipAddress,
    });

    return auditLog.save();
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid MongoDB id: ${id}`);
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as MongoServerErrorShape).code === 11000
    );
  }
}
