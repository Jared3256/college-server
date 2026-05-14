import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Attendance,
  AttendanceSchema,
} from '../attendance/entities/attendance.entity';
import {
  CourseUnit,
  CourseUnitSchema,
} from '../course-unit/entities/course-unit.entity';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollment/entities/enrollment.entity';
import { Lecturer, LecturerSchema } from '../lecturer/entities/lecturer.entity';
import { Semester, SemesterSchema } from '../semester/entities/semester.entity';
import { Student, StudentSchema } from '../student/entities/student.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import {
  Exam,
  ExamAuditLog,
  ExamAuditLogSchema,
  ExamAttendance,
  ExamAttendanceSchema,
  ExamAttempt,
  ExamAttemptSchema,
  ExamEligibility,
  ExamEligibilitySchema,
  ExamMalpractice,
  ExamMalpracticeSchema,
  ExamModeration,
  ExamModerationSchema,
  ExamPublication,
  ExamPublicationSchema,
  ExamQuestion,
  ExamQuestionSchema,
  ExamResult,
  ExamResultSchema,
  ExamSchema,
  ExamSession,
  ExamSessionSchema,
  ExamSubmission,
  ExamSubmissionSchema,
} from './entities/exam.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamSession.name, schema: ExamSessionSchema },
      { name: ExamEligibility.name, schema: ExamEligibilitySchema },
      { name: ExamQuestion.name, schema: ExamQuestionSchema },
      { name: ExamAttempt.name, schema: ExamAttemptSchema },
      { name: ExamSubmission.name, schema: ExamSubmissionSchema },
      { name: ExamResult.name, schema: ExamResultSchema },
      { name: ExamModeration.name, schema: ExamModerationSchema },
      { name: ExamAttendance.name, schema: ExamAttendanceSchema },
      { name: ExamMalpractice.name, schema: ExamMalpracticeSchema },
      { name: ExamPublication.name, schema: ExamPublicationSchema },
      { name: ExamAuditLog.name, schema: ExamAuditLogSchema },
      { name: CourseUnit.name, schema: CourseUnitSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Lecturer.name, schema: LecturerSchema },
      { name: User.name, schema: UserSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
})
export class ExamsModule {}
