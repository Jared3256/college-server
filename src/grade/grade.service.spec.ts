import { ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { CourseUnit } from '../course-unit/entities/course-unit.entity';
import { Course } from '../course/entities/course.entity';
import { Department } from '../department/entities/department.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Exam } from '../exams/entities/exam.entity';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { Notification } from '../notification/entities/notification.entity';
import { ParentStudentLink } from '../parent-student-link/entities/parent-student-link.entity';
import { Parent } from '../parent/entities/parent.entity';
import { Student } from '../student/entities/student.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Grade, GradeStatus } from './entities/grade.entity';
import { GradeService } from './grade.service';

const execResult = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

const findResult = <T>(value: T) => ({
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(value),
});

type GradeModelMock = jest.Mock & {
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  find: jest.Mock;
};

describe('GradeService', () => {
  let service: GradeService;
  let gradeModel: GradeModelMock;
  let auditLogModel: jest.Mock;
  let studentModel: { findById: jest.Mock };
  let courseUnitModel: { findById: jest.Mock; find: jest.Mock };
  let courseModel: { findById: jest.Mock };
  let examModel: { findById: jest.Mock };
  let lecturerModel: { findOne: jest.Mock };
  let userModel: { findById: jest.Mock };
  let departmentModel: { findById: jest.Mock };
  let enrollmentModel: { countDocuments: jest.Mock };
  let notificationModel: { create: jest.Mock };
  let parentStudentLinkModel: { find: jest.Mock; findOne: jest.Mock };
  let parentModel: { find: jest.Mock; findOne: jest.Mock };

  const gradeId = new Types.ObjectId();
  const studentId = new Types.ObjectId();
  const courseUnitId = new Types.ObjectId();
  const examId = new Types.ObjectId();
  const courseId = new Types.ObjectId();
  const semesterId = new Types.ObjectId();
  const departmentId = new Types.ObjectId();
  const lecturerId = new Types.ObjectId();
  const hodLecturerId = new Types.ObjectId();
  const lecturerUserId = new Types.ObjectId();
  const hodUserId = new Types.ObjectId();
  const studentUserId = new Types.ObjectId();
  const parentId = new Types.ObjectId();
  const parentUserId = new Types.ObjectId();

  const lecturerUser = {
    _id: lecturerUserId,
    role: UserRole.LECTURER,
  };
  const hodUser = {
    _id: hodUserId,
    role: UserRole.LECTURER,
  };
  const lecturer = {
    _id: lecturerId,
    userId: lecturerUserId,
    departmentId,
  };
  const hodLecturer = {
    _id: hodLecturerId,
    userId: hodUserId,
    departmentId,
  };
  const student = {
    _id: studentId,
    userId: studentUserId,
    courseId,
    departmentId,
  };
  const courseUnit = {
    _id: courseUnitId,
    courseId,
    semesterId,
    lecturerId,
  };
  const exam = {
    _id: examId,
    courseUnitId,
    totalMarks: 100,
  };
  const course = {
    _id: courseId,
    departmentId,
  };
  const department = {
    _id: departmentId,
    hodId: hodLecturerId,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    gradeModel = Object.assign(
      jest.fn().mockImplementation((data: Record<string, unknown>) => ({
        ...data,
        _id: gradeId,
        save: jest.fn().mockResolvedValue({ ...data, _id: gradeId }),
      })),
      {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        find: jest.fn(),
      },
    ) as GradeModelMock;
    auditLogModel = jest
      .fn()
      .mockImplementation((data: Record<string, unknown>) => ({
        ...data,
        _id: new Types.ObjectId(),
        save: jest
          .fn()
          .mockResolvedValue({ ...data, _id: new Types.ObjectId() }),
      }));
    studentModel = { findById: jest.fn() };
    courseUnitModel = { findById: jest.fn(), find: jest.fn() };
    courseModel = { findById: jest.fn() };
    examModel = { findById: jest.fn() };
    lecturerModel = { findOne: jest.fn() };
    userModel = { findById: jest.fn() };
    departmentModel = { findById: jest.fn() };
    enrollmentModel = { countDocuments: jest.fn() };
    notificationModel = { create: jest.fn().mockResolvedValue([]) };
    parentStudentLinkModel = { find: jest.fn(), findOne: jest.fn() };
    parentModel = { find: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradeService,
        { provide: getModelToken(Grade.name), useValue: gradeModel },
        { provide: getModelToken(Student.name), useValue: studentModel },
        { provide: getModelToken(CourseUnit.name), useValue: courseUnitModel },
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Exam.name), useValue: examModel },
        { provide: getModelToken(Lecturer.name), useValue: lecturerModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Department.name), useValue: departmentModel },
        { provide: getModelToken(Enrollment.name), useValue: enrollmentModel },
        { provide: getModelToken(AuditLog.name), useValue: auditLogModel },
        {
          provide: getModelToken(Notification.name),
          useValue: notificationModel,
        },
        {
          provide: getModelToken(ParentStudentLink.name),
          useValue: parentStudentLinkModel,
        },
        { provide: getModelToken(Parent.name), useValue: parentModel },
      ],
    }).compile();

    service = module.get<GradeService>(GradeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a draft grade when lecturer owns the course unit', async () => {
    userModel.findById.mockReturnValue(execResult(lecturerUser));
    lecturerModel.findOne.mockReturnValue(execResult(lecturer));
    studentModel.findById.mockReturnValue(execResult(student));
    courseUnitModel.findById.mockReturnValue(execResult(courseUnit));
    examModel.findById.mockReturnValue(execResult(exam));
    enrollmentModel.countDocuments.mockReturnValue(execResult(1));

    const response = await service.create({
      studentId: studentId.toString(),
      courseUnitId: courseUnitId.toString(),
      examId: examId.toString(),
      marksScored: 78,
      remarks: 'Good performance',
      enteredBy: lecturerUserId.toString(),
    });

    expect(response.success).toBe(true);
    expect(response.data?.status).toBe(GradeStatus.DRAFT);
    expect(gradeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        marksScored: 78,
        grade: 'A',
        GPAContribution: 4,
        status: GradeStatus.DRAFT,
        visibleToStudent: false,
      }),
    );
    expect(auditLogModel).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'GRADE_CREATED',
        module: 'grades',
      }),
    );
  });

  it('rejects grade creation for an unassigned lecturer', async () => {
    userModel.findById.mockReturnValue(execResult(lecturerUser));
    lecturerModel.findOne.mockReturnValue(execResult(lecturer));
    studentModel.findById.mockReturnValue(execResult(student));
    courseUnitModel.findById.mockReturnValue(
      execResult({ ...courseUnit, lecturerId: new Types.ObjectId() }),
    );
    examModel.findById.mockReturnValue(execResult(exam));
    courseModel.findById.mockReturnValue(execResult(course));
    departmentModel.findById.mockReturnValue(execResult(department));

    await expect(
      service.create({
        studentId: studentId.toString(),
        courseUnitId: courseUnitId.toString(),
        examId: examId.toString(),
        marksScored: 78,
        enteredBy: lecturerUserId.toString(),
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows the department HOD to approve a submitted grade', async () => {
    const submittedGrade = {
      _id: gradeId,
      studentId,
      courseUnitId,
      examId,
      marksScored: 62,
      grade: 'B+',
      GPAContribution: 3.5,
      status: GradeStatus.SUBMITTED,
      visibleToStudent: false,
      enteredBy: lecturerUserId,
    };
    const approvedGrade = {
      ...submittedGrade,
      marksScored: 84,
      grade: 'A',
      GPAContribution: 4,
      status: GradeStatus.APPROVED,
      approvedBy: hodUserId,
    };
    gradeModel.findById.mockReturnValue(execResult(submittedGrade));
    userModel.findById.mockReturnValue(execResult(hodUser));
    lecturerModel.findOne.mockReturnValue(execResult(hodLecturer));
    courseUnitModel.findById.mockReturnValue(execResult(courseUnit));
    examModel.findById.mockReturnValue(execResult(exam));
    courseModel.findById.mockReturnValue(execResult(course));
    departmentModel.findById.mockReturnValue(execResult(department));
    gradeModel.findByIdAndUpdate.mockReturnValue(execResult(approvedGrade));

    const response = await service.update(gradeId.toString(), {
      marksScored: 84,
      remarks: 'Adjusted after moderation',
      modifiedBy: hodUserId.toString(),
      status: GradeStatus.APPROVED,
      reason: 'Moderation adjustment',
    });

    expect(response.data?.status).toBe(GradeStatus.APPROVED);
    expect(gradeModel.findByIdAndUpdate).toHaveBeenCalledWith(
      gradeId.toString(),
      expect.objectContaining({
        marksScored: 84,
        grade: 'A',
        GPAContribution: 4,
        status: GradeStatus.APPROVED,
        approvedBy: hodUserId,
      }),
      { new: true, runValidators: true },
    );
    expect(auditLogModel).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'GRADE_APPROVED' }),
    );
  });

  it('publishes approved grades and creates student and parent notifications', async () => {
    const approvedGrade = {
      _id: gradeId,
      studentId,
      courseUnitId,
      examId,
      marksScored: 84,
      grade: 'A',
      GPAContribution: 4,
      status: GradeStatus.APPROVED,
      visibleToStudent: false,
      enteredBy: lecturerUserId,
    };
    const publishedGrade = {
      ...approvedGrade,
      status: GradeStatus.PUBLISHED,
      visibleToStudent: true,
    };
    gradeModel.findById.mockReturnValue(execResult(approvedGrade));
    userModel.findById.mockReturnValue(execResult(hodUser));
    lecturerModel.findOne.mockReturnValue(execResult(hodLecturer));
    courseUnitModel.findById.mockReturnValue(execResult(courseUnit));
    courseModel.findById.mockReturnValue(execResult(course));
    departmentModel.findById.mockReturnValue(execResult(department));
    gradeModel.findByIdAndUpdate.mockReturnValue(execResult(publishedGrade));
    studentModel.findById.mockReturnValue(execResult(student));
    parentStudentLinkModel.find.mockReturnValue(
      execResult([{ parentId, studentId, canReceiveNotifications: true }]),
    );
    parentModel.find.mockReturnValue(
      execResult([{ _id: parentId, userId: parentUserId }]),
    );

    const response = await service.publish(gradeId.toString(), {
      publishedBy: hodUserId.toString(),
    });

    expect(response.data?.status).toBe(GradeStatus.PUBLISHED);
    expect(notificationModel.create).toHaveBeenCalledWith([
      expect.objectContaining({ userId: studentUserId }),
      expect.objectContaining({ userId: parentUserId }),
    ]);
    expect(auditLogModel).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'GRADE_PUBLISHED' }),
    );
  });

  it('limits student self-service reads to published visible grades', async () => {
    const studentUser = { _id: studentUserId, role: UserRole.STUDENT };
    userModel.findById.mockReturnValue(execResult(studentUser));
    lecturerModel.findOne.mockReturnValue(execResult(null));
    studentModel.findById.mockReturnValue(execResult(student));
    gradeModel.find.mockReturnValue(findResult([]));

    await service.findByStudent(studentId.toString(), {
      viewerUserId: studentUserId.toString(),
    });

    expect(gradeModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId,
        status: GradeStatus.PUBLISHED,
        visibleToStudent: true,
      }),
    );
  });
});
