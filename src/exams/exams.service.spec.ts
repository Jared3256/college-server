import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Attendance } from '../attendance/entities/attendance.entity';
import { CourseUnit } from '../course-unit/entities/course-unit.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { Semester } from '../semester/entities/semester.entity';
import { Student } from '../student/entities/student.entity';
import { User } from '../user/entities/user.entity';
import {
  Exam,
  ExamAuditLog,
  ExamAttendance,
  ExamAttempt,
  ExamEligibility,
  ExamMalpractice,
  ExamModeration,
  ExamPublication,
  ExamQuestion,
  ExamResult,
  ExamSession,
  ExamSubmission,
} from './entities/exam.entity';
import { ExamsService } from './exams.service';

describe('ExamsService', () => {
  let service: ExamsService;
  const modelMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: getModelToken(Exam.name), useValue: modelMock },
        { provide: getModelToken(ExamSession.name), useValue: modelMock },
        { provide: getModelToken(ExamEligibility.name), useValue: modelMock },
        { provide: getModelToken(ExamQuestion.name), useValue: modelMock },
        { provide: getModelToken(ExamAttempt.name), useValue: modelMock },
        { provide: getModelToken(ExamSubmission.name), useValue: modelMock },
        { provide: getModelToken(ExamResult.name), useValue: modelMock },
        { provide: getModelToken(ExamModeration.name), useValue: modelMock },
        { provide: getModelToken(ExamAttendance.name), useValue: modelMock },
        { provide: getModelToken(ExamMalpractice.name), useValue: modelMock },
        { provide: getModelToken(ExamPublication.name), useValue: modelMock },
        { provide: getModelToken(ExamAuditLog.name), useValue: modelMock },
        { provide: getModelToken(CourseUnit.name), useValue: modelMock },
        { provide: getModelToken(Semester.name), useValue: modelMock },
        { provide: getModelToken(Student.name), useValue: modelMock },
        { provide: getModelToken(Lecturer.name), useValue: modelMock },
        { provide: getModelToken(User.name), useValue: modelMock },
        { provide: getModelToken(Enrollment.name), useValue: modelMock },
        { provide: getModelToken(Attendance.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject malpractice deletion', () => {
    expect(() => service.removeMalpractice('ignored')).toThrow(
      ConflictException,
    );
  });
});
