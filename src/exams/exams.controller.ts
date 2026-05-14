import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
  ExamAttemptDocument,
  ExamAuditLogDocument,
  ExamAttendanceDocument,
  ExamDocument,
  ExamEligibilityDocument,
  ExamMalpracticeDocument,
  ExamModerationDocument,
  ExamPublicationDocument,
  ExamQuestionDocument,
  ExamResultDocument,
  ExamSessionDocument,
  ExamSubmissionDocument,
} from './entities/exam.entity';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  async create(@Body() createExamDto: CreateExamDto): Promise<ExamDocument> {
    return this.examsService.create(createExamDto);
  }

  @Get()
  async findAll(): Promise<ExamDocument[]> {
    return this.examsService.findAll();
  }

  @Get('sessions/:sessionId')
  async findSession(
    @Param('sessionId') sessionId: string,
  ): Promise<ExamSessionDocument> {
    return this.examsService.findSession(sessionId);
  }

  @Patch('sessions/:sessionId')
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body() updateSessionDto: UpdateExamSessionDto,
  ): Promise<ExamSessionDocument> {
    return this.examsService.updateSession(sessionId, updateSessionDto);
  }

  @Delete('sessions/:sessionId')
  async removeSession(
    @Param('sessionId') sessionId: string,
  ): Promise<ExamSessionDocument> {
    return this.examsService.removeSession(sessionId);
  }

  @Post('sessions/:sessionId/attendance')
  async recordAttendance(
    @Param('sessionId') sessionId: string,
    @Body() attendanceDto: CreateExamAttendanceDto,
  ): Promise<ExamAttendanceDocument> {
    return this.examsService.recordAttendance(sessionId, attendanceDto);
  }

  @Get('sessions/:sessionId/attendance')
  async findAttendanceBySession(
    @Param('sessionId') sessionId: string,
  ): Promise<ExamAttendanceDocument[]> {
    return this.examsService.findAttendanceBySession(sessionId);
  }

  @Get('eligibility/:eligibilityId')
  async findEligibility(
    @Param('eligibilityId') eligibilityId: string,
  ): Promise<ExamEligibilityDocument> {
    return this.examsService.findEligibility(eligibilityId);
  }

  @Patch('eligibility/:eligibilityId')
  async updateEligibility(
    @Param('eligibilityId') eligibilityId: string,
    @Body() updateEligibilityDto: UpdateExamEligibilityDto,
  ): Promise<ExamEligibilityDocument> {
    return this.examsService.updateEligibility(
      eligibilityId,
      updateEligibilityDto,
    );
  }

  @Patch('questions/:questionId')
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateExamQuestionDto,
  ): Promise<ExamQuestionDocument> {
    return this.examsService.updateQuestion(questionId, updateQuestionDto);
  }

  @Get('questions/:questionId')
  async findQuestion(
    @Param('questionId') questionId: string,
  ): Promise<ExamQuestionDocument> {
    return this.examsService.findQuestion(questionId);
  }

  @Delete('questions/:questionId')
  async removeQuestion(
    @Param('questionId') questionId: string,
  ): Promise<ExamQuestionDocument> {
    return this.examsService.removeQuestion(questionId);
  }

  @Get('attempts/:attemptId/submission')
  async findSubmissionByAttempt(
    @Param('attemptId') attemptId: string,
  ): Promise<ExamSubmissionDocument> {
    return this.examsService.findSubmissionByAttempt(attemptId);
  }

  @Post('attempts/:attemptId/start')
  async startAttempt(
    @Param('attemptId') attemptId: string,
    @Body() startDto: StartExamAttemptDto,
  ): Promise<ExamAttemptDocument> {
    return this.examsService.startAttempt(attemptId, startDto);
  }

  @Patch('attempts/:attemptId/autosave')
  async autoSaveSubmission(
    @Param('attemptId') attemptId: string,
    @Body() autoSaveDto: AutoSaveExamSubmissionDto,
  ): Promise<ExamSubmissionDocument> {
    return this.examsService.autoSaveSubmission(attemptId, autoSaveDto);
  }

  @Post('attempts/:attemptId/submit')
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @Body() submitDto: SubmitExamSubmissionDto,
  ): Promise<ExamSubmissionDocument> {
    return this.examsService.submitAttempt(attemptId, submitDto);
  }

  @Get('attempts/:attemptId')
  async findAttempt(
    @Param('attemptId') attemptId: string,
  ): Promise<ExamAttemptDocument> {
    return this.examsService.findAttempt(attemptId);
  }

  @Get('submissions/:submissionId')
  async findSubmission(
    @Param('submissionId') submissionId: string,
  ): Promise<ExamSubmissionDocument> {
    return this.examsService.findSubmission(submissionId);
  }

  @Patch('results/:resultId')
  async updateResult(
    @Param('resultId') resultId: string,
    @Body() updateResultDto: UpdateExamResultDto,
  ): Promise<ExamResultDocument> {
    return this.examsService.updateResult(resultId, updateResultDto);
  }

  @Get('results/:resultId')
  async findResult(
    @Param('resultId') resultId: string,
  ): Promise<ExamResultDocument> {
    return this.examsService.findResult(resultId);
  }

  @Patch('moderations/:moderationId')
  async updateModeration(
    @Param('moderationId') moderationId: string,
    @Body() updateModerationDto: UpdateExamModerationDto,
  ): Promise<ExamModerationDocument> {
    return this.examsService.updateModeration(
      moderationId,
      updateModerationDto,
    );
  }

  @Get('moderations/:moderationId')
  async findModeration(
    @Param('moderationId') moderationId: string,
  ): Promise<ExamModerationDocument> {
    return this.examsService.findModeration(moderationId);
  }

  @Patch('attendance/:attendanceId')
  async updateAttendance(
    @Param('attendanceId') attendanceId: string,
    @Body() updateAttendanceDto: UpdateExamAttendanceDto,
  ): Promise<ExamAttendanceDocument> {
    return this.examsService.updateAttendance(
      attendanceId,
      updateAttendanceDto,
    );
  }

  @Get('attendance/:attendanceId')
  async findAttendance(
    @Param('attendanceId') attendanceId: string,
  ): Promise<ExamAttendanceDocument> {
    return this.examsService.findAttendance(attendanceId);
  }

  @Patch('malpractice/:malpracticeId')
  async updateMalpractice(
    @Param('malpracticeId') malpracticeId: string,
    @Body() updateMalpracticeDto: UpdateExamMalpracticeDto,
  ): Promise<ExamMalpracticeDocument> {
    return this.examsService.updateMalpractice(
      malpracticeId,
      updateMalpracticeDto,
    );
  }

  @Get('malpractice/:malpracticeId')
  async findMalpractice(
    @Param('malpracticeId') malpracticeId: string,
  ): Promise<ExamMalpracticeDocument> {
    return this.examsService.findMalpractice(malpracticeId);
  }

  @Delete('malpractice/:malpracticeId')
  removeMalpractice(@Param('malpracticeId') malpracticeId: string): never {
    return this.examsService.removeMalpractice(malpracticeId);
  }

  @Get('publications/:publicationId')
  async findPublication(
    @Param('publicationId') publicationId: string,
  ): Promise<ExamPublicationDocument> {
    return this.examsService.findPublication(publicationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ExamDocument> {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
  ): Promise<ExamDocument> {
    return this.examsService.update(id, updateExamDto);
  }

  @Patch(':id/approval')
  async updateApprovalStatus(
    @Param('id') id: string,
    @Body() approvalDto: UpdateExamApprovalDto,
  ): Promise<ExamDocument> {
    return this.examsService.updateApprovalStatus(id, approvalDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() archiveDto: ArchiveExamDto,
  ): Promise<ExamDocument> {
    return this.examsService.remove(id, archiveDto);
  }

  @Post(':examId/sessions')
  async createSession(
    @Param('examId') examId: string,
    @Body() createSessionDto: CreateExamSessionDto,
  ): Promise<ExamSessionDocument> {
    return this.examsService.createSession(examId, createSessionDto);
  }

  @Get(':examId/sessions')
  async findSessionsByExam(
    @Param('examId') examId: string,
  ): Promise<ExamSessionDocument[]> {
    return this.examsService.findSessionsByExam(examId);
  }

  @Post(':examId/eligibility')
  async checkEligibility(
    @Param('examId') examId: string,
    @Body() eligibilityDto: CreateExamEligibilityDto,
  ): Promise<ExamEligibilityDocument> {
    return this.examsService.checkEligibility(examId, eligibilityDto);
  }

  @Get(':examId/eligibility')
  async findEligibilityByExam(
    @Param('examId') examId: string,
  ): Promise<ExamEligibilityDocument[]> {
    return this.examsService.findEligibilityByExam(examId);
  }

  @Post(':examId/questions')
  async createQuestion(
    @Param('examId') examId: string,
    @Body() questionDto: CreateExamQuestionDto,
  ): Promise<ExamQuestionDocument> {
    return this.examsService.createQuestion(examId, questionDto);
  }

  @Get(':examId/questions')
  async findQuestionsByExam(
    @Param('examId') examId: string,
  ): Promise<ExamQuestionDocument[]> {
    return this.examsService.findQuestionsByExam(examId);
  }

  @Post(':examId/attempts')
  async createAttempt(
    @Param('examId') examId: string,
    @Body() attemptDto: CreateExamAttemptDto,
  ): Promise<ExamAttemptDocument> {
    return this.examsService.createAttempt(examId, attemptDto);
  }

  @Get(':examId/attempts')
  async findAttemptsByExam(
    @Param('examId') examId: string,
  ): Promise<ExamAttemptDocument[]> {
    return this.examsService.findAttemptsByExam(examId);
  }

  @Post(':examId/results')
  async createResult(
    @Param('examId') examId: string,
    @Body() resultDto: CreateExamResultDto,
  ): Promise<ExamResultDocument> {
    return this.examsService.createResult(examId, resultDto);
  }

  @Get(':examId/results')
  async findResultsByExam(
    @Param('examId') examId: string,
  ): Promise<ExamResultDocument[]> {
    return this.examsService.findResultsByExam(examId);
  }

  @Post(':examId/moderations')
  async createModeration(
    @Param('examId') examId: string,
    @Body() moderationDto: CreateExamModerationDto,
  ): Promise<ExamModerationDocument> {
    return this.examsService.createModeration(examId, moderationDto);
  }

  @Get(':examId/moderations')
  async findModerationsByExam(
    @Param('examId') examId: string,
  ): Promise<ExamModerationDocument[]> {
    return this.examsService.findModerationsByExam(examId);
  }

  @Post(':examId/malpractice')
  async createMalpractice(
    @Param('examId') examId: string,
    @Body() malpracticeDto: CreateExamMalpracticeDto,
  ): Promise<ExamMalpracticeDocument> {
    return this.examsService.createMalpractice(examId, malpracticeDto);
  }

  @Get(':examId/malpractice')
  async findMalpracticeByExam(
    @Param('examId') examId: string,
  ): Promise<ExamMalpracticeDocument[]> {
    return this.examsService.findMalpracticeByExam(examId);
  }

  @Post(':examId/publications')
  async publishResults(
    @Param('examId') examId: string,
    @Body() publishDto: PublishExamResultsDto,
  ): Promise<ExamPublicationDocument> {
    return this.examsService.publishResults(examId, publishDto);
  }

  @Get(':examId/publications')
  async findPublicationsByExam(
    @Param('examId') examId: string,
  ): Promise<ExamPublicationDocument[]> {
    return this.examsService.findPublicationsByExam(examId);
  }

  @Get(':examId/audit-logs')
  async findAuditLogsByExam(
    @Param('examId') examId: string,
  ): Promise<ExamAuditLogDocument[]> {
    return this.examsService.findAuditLogsByExam(examId);
  }
}
