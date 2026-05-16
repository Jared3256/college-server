import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../audit-log/entities/audit-log.entity';
import {
  CourseUnit,
  CourseUnitDocument,
} from '../course-unit/entities/course-unit.entity';
import { Course, CourseDocument } from '../course/entities/course.entity';
import { Department } from '../department/entities/department.entity';
import {
  Enrollment,
  EnrollmentStatus,
} from '../enrollment/entities/enrollment.entity';
import { Exam, ExamDocument } from '../exams/entities/exam.entity';
import {
  Lecturer,
  LecturerDocument,
} from '../lecturer/entities/lecturer.entity';
import {
  Notification,
  NotificationType,
} from '../notification/entities/notification.entity';
import { ParentStudentLink } from '../parent-student-link/entities/parent-student-link.entity';
import { Parent } from '../parent/entities/parent.entity';
import { Student, StudentDocument } from '../student/entities/student.entity';
import { User, UserDocument, UserRole } from '../user/entities/user.entity';
import {
  BulkCreateGradeDto,
  BulkGradeResponseDto,
  CourseUnitGradesQueryDto,
  CreateGradeDto,
  GradeIdentifierResponseDto,
  GradeResponseDto,
  PublishGradeDto,
  StudentGradesQueryDto,
  SubmitGradeDto,
  UpdateGradeDto,
} from './dto/create-grade.dto';
import { Grade, GradeDocument, GradeStatus } from './entities/grade.entity';

interface MongoServerErrorShape {
  code?: number;
}

interface ActorContext {
  user: UserDocument;
  lecturer?: LecturerDocument;
}

interface GradeScaleResult {
  grade: string;
  GPAContribution: number;
}

interface GradeUpdateFields {
  marksScored?: number;
  grade?: string;
  GPAContribution?: number;
  remarks?: string;
  approvedBy?: Types.ObjectId;
  status?: GradeStatus;
  visibleToStudent?: boolean;
}

interface GradeAuditSnapshot {
  marksScored: number;
  grade: string;
  GPAContribution: number;
  remarks?: string;
  status: GradeStatus;
  visibleToStudent: boolean;
}

@Injectable()
export class GradeService {
  private readonly logger = new Logger(GradeService.name);

  constructor(
    @InjectModel(Grade.name)
    private readonly gradeModel: Model<Grade>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
    @InjectModel(CourseUnit.name)
    private readonly courseUnitModel: Model<CourseUnit>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Exam.name)
    private readonly examModel: Model<Exam>,
    @InjectModel(Lecturer.name)
    private readonly lecturerModel: Model<Lecturer>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLog>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectModel(ParentStudentLink.name)
    private readonly parentStudentLinkModel: Model<ParentStudentLink>,
    @InjectModel(Parent.name)
    private readonly parentModel: Model<Parent>,
  ) {}

  async create(
    createGradeDto: CreateGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    const actor = await this.ensureActor(createGradeDto.enteredBy);
    const student = await this.ensureStudentExists(createGradeDto.studentId);
    const courseUnit = await this.ensureCourseUnitExists(
      createGradeDto.courseUnitId,
    );
    const exam = await this.ensureExamExists(createGradeDto.examId);

    await this.ensureCanEnterGrade(actor, courseUnit);
    await this.ensureStudentEnrolled(student._id, courseUnit._id);
    this.ensureExamBelongsToCourseUnit(exam, courseUnit);
    this.validateMarks(createGradeDto.marksScored, exam);

    try {
      const scale = this.calculateGrade(createGradeDto.marksScored);
      const grade = new this.gradeModel({
        studentId: student._id,
        courseUnitId: courseUnit._id,
        examId: exam._id,
        marksScored: createGradeDto.marksScored,
        grade: scale.grade,
        GPAContribution: scale.GPAContribution,
        remarks: createGradeDto.remarks,
        enteredBy: actor.user._id,
        gradedBy: actor.lecturer?._id,
        status: GradeStatus.DRAFT,
        visibleToStudent: false,
      });

      const savedGrade = await grade.save();
      await this.recordAuditLog(actor.user._id, 'GRADE_CREATED', {
        gradeId: savedGrade._id,
        studentId: student._id,
        courseUnitId: courseUnit._id,
        examId: exam._id,
        marksScored: savedGrade.marksScored,
        grade: savedGrade.grade,
      });

      return {
        success: true,
        message: 'Grade created successfully',
        data: this.toIdentifierResponse(savedGrade),
      };
    } catch (error: unknown) {
      this.logger.error('Grade creation failed', error);
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A grade for this student and exam already exists',
        );
      }
      throw error;
    }
  }

  async createBulk(
    bulkDto: BulkCreateGradeDto,
  ): Promise<GradeResponseDto<BulkGradeResponseDto>> {
    if (bulkDto.grades.length === 0) {
      throw new BadRequestException('At least one grade entry is required');
    }

    const actor = await this.ensureActor(bulkDto.enteredBy);
    const exam = await this.ensureExamExists(bulkDto.examId);
    const courseUnit = await this.ensureCourseUnitExists(
      bulkDto.courseUnitId ?? exam.courseUnitId.toString(),
    );

    await this.ensureCanEnterGrade(actor, courseUnit);
    this.ensureExamBelongsToCourseUnit(exam, courseUnit);
    this.ensureNoDuplicateStudentsInPayload(
      bulkDto.grades.map((grade) => grade.studentId),
    );

    const existingGrades = await this.gradeModel
      .find({
        examId: exam._id,
        studentId: {
          $in: bulkDto.grades.map(
            (grade) => new Types.ObjectId(grade.studentId),
          ),
        },
      })
      .exec();

    if (existingGrades.length > 0) {
      throw new ConflictException(
        'One or more students already have grades for this exam',
      );
    }

    const savedGrades: GradeDocument[] = [];
    for (const gradeEntry of bulkDto.grades) {
      const student = await this.ensureStudentExists(gradeEntry.studentId);
      await this.ensureStudentEnrolled(student._id, courseUnit._id);
      this.validateMarks(gradeEntry.marksScored, exam);
      const scale = this.calculateGrade(gradeEntry.marksScored);
      const grade = new this.gradeModel({
        studentId: student._id,
        courseUnitId: courseUnit._id,
        examId: exam._id,
        marksScored: gradeEntry.marksScored,
        grade: scale.grade,
        GPAContribution: scale.GPAContribution,
        remarks: gradeEntry.remarks,
        enteredBy: actor.user._id,
        gradedBy: actor.lecturer?._id,
        status: GradeStatus.DRAFT,
        visibleToStudent: false,
      });

      const savedGrade = await grade.save();
      savedGrades.push(savedGrade);
      await this.recordAuditLog(actor.user._id, 'GRADE_CREATED', {
        gradeId: savedGrade._id,
        studentId: student._id,
        courseUnitId: courseUnit._id,
        examId: exam._id,
        marksScored: savedGrade.marksScored,
        grade: savedGrade.grade,
        source: 'bulk',
      });
    }

    return {
      success: true,
      message: 'Bulk grades created successfully',
      data: {
        createdCount: savedGrades.length,
        grades: savedGrades.map((grade) => this.toIdentifierResponse(grade)),
      },
    };
  }

  async submit(
    gradeId: string,
    submitDto: SubmitGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    const grade = await this.ensureGradeExists(gradeId);
    const actor = await this.ensureActor(submitDto.submittedBy);
    const courseUnit = await this.ensureCourseUnitExists(
      grade.courseUnitId.toString(),
    );

    this.ensureCanSubmitGrade(actor, grade, courseUnit);

    if (grade.status !== GradeStatus.DRAFT) {
      throw new ConflictException('Only draft grades can be submitted');
    }

    const updatedGrade = await this.gradeModel
      .findByIdAndUpdate(
        gradeId,
        { status: GradeStatus.SUBMITTED },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedGrade) {
      throw new NotFoundException(`Grade with id ${gradeId} was not found`);
    }

    await this.recordAuditLog(
      actor.user._id,
      'GRADE_SUBMITTED',
      {
        gradeId: updatedGrade._id,
        previousStatus: GradeStatus.DRAFT,
        nextStatus: updatedGrade.status,
      },
      submitDto.ipAddress,
    );

    return {
      success: true,
      message: 'Grade submitted for approval',
      data: this.toIdentifierResponse(updatedGrade),
    };
  }

  async update(
    gradeId: string,
    updateDto: UpdateGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    const grade = await this.ensureGradeExists(gradeId);
    const actor = await this.ensureActor(updateDto.modifiedBy);
    const courseUnit = await this.ensureCourseUnitExists(
      grade.courseUnitId.toString(),
    );
    const exam = await this.ensureExamExists(grade.examId.toString());

    await this.ensureCanModerateGrade(actor, courseUnit);

    if (grade.status !== GradeStatus.SUBMITTED) {
      throw new ConflictException('Only submitted grades can be moderated');
    }

    const nextStatus = updateDto.status ?? GradeStatus.APPROVED;
    if (![GradeStatus.APPROVED, GradeStatus.REJECTED].includes(nextStatus)) {
      throw new BadRequestException(
        'Grade moderation status must be APPROVED or REJECTED',
      );
    }

    const updateFields: GradeUpdateFields = {
      status: nextStatus,
      visibleToStudent: false,
    };

    if (updateDto.marksScored !== undefined) {
      this.validateMarks(updateDto.marksScored, exam);
      const scale = this.calculateGrade(updateDto.marksScored);
      updateFields.marksScored = updateDto.marksScored;
      updateFields.grade = scale.grade;
      updateFields.GPAContribution = scale.GPAContribution;
    }

    if (updateDto.remarks !== undefined) {
      updateFields.remarks = updateDto.remarks;
    }

    if (nextStatus === GradeStatus.APPROVED) {
      updateFields.approvedBy = actor.user._id;
    }

    const previousValues = this.toAuditSnapshot(grade);
    const updatedGrade = await this.gradeModel
      .findByIdAndUpdate(gradeId, updateFields, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedGrade) {
      throw new NotFoundException(`Grade with id ${gradeId} was not found`);
    }

    const action =
      nextStatus === GradeStatus.APPROVED ? 'GRADE_APPROVED' : 'GRADE_REJECTED';
    await this.recordAuditLog(
      actor.user._id,
      action,
      {
        gradeId: updatedGrade._id,
        previousValues,
        nextValues: this.toAuditSnapshot(updatedGrade),
        reason: updateDto.reason,
      },
      updateDto.ipAddress,
    );

    return {
      success: true,
      message: 'Grade updated successfully',
      data: this.toIdentifierResponse(updatedGrade),
    };
  }

  async publish(
    gradeId: string,
    publishDto: PublishGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    const grade = await this.ensureGradeExists(gradeId);
    const actor = await this.ensureActor(publishDto.publishedBy);
    const courseUnit = await this.ensureCourseUnitExists(
      grade.courseUnitId.toString(),
    );

    await this.ensureCanModerateGrade(actor, courseUnit);

    if (grade.status !== GradeStatus.APPROVED) {
      throw new ConflictException('Grade must be approved before publication');
    }

    const updatedGrade = await this.gradeModel
      .findByIdAndUpdate(
        gradeId,
        { status: GradeStatus.PUBLISHED, visibleToStudent: true },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedGrade) {
      throw new NotFoundException(`Grade with id ${gradeId} was not found`);
    }

    await this.createPublicationNotifications(updatedGrade);
    await this.recordAuditLog(
      actor.user._id,
      'GRADE_PUBLISHED',
      {
        gradeId: updatedGrade._id,
        studentId: updatedGrade.studentId,
        courseUnitId: updatedGrade.courseUnitId,
        examId: updatedGrade.examId,
      },
      publishDto.ipAddress,
    );

    return {
      success: true,
      message: 'Grade published successfully',
      data: this.toIdentifierResponse(updatedGrade),
    };
  }

  async findByStudent(
    studentId: string,
    queryDto: StudentGradesQueryDto,
  ): Promise<GradeResponseDto<GradeDocument[]>> {
    const student = await this.ensureStudentExists(studentId);
    const actor = await this.ensureActor(queryDto.viewerUserId);
    const canSeeUnpublished = await this.ensureCanViewStudentGrades(
      actor,
      student,
    );
    const query: Record<string, unknown> = { studentId: student._id };

    if (queryDto.courseUnitId) {
      query.courseUnitId = new Types.ObjectId(queryDto.courseUnitId);
    }

    if (queryDto.semesterId) {
      const courseUnitIds = await this.resolveCourseUnitIdsForSemester(
        queryDto.semesterId,
        queryDto.courseUnitId,
      );
      query.courseUnitId = { $in: courseUnitIds };
    }

    if (!canSeeUnpublished || queryDto.publishedOnly) {
      query.status = GradeStatus.PUBLISHED;
      query.visibleToStudent = true;
    }

    const grades = await this.gradeModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      data: grades,
    };
  }

  async findByCourseUnit(
    courseUnitId: string,
    queryDto: CourseUnitGradesQueryDto,
  ): Promise<GradeResponseDto<GradeDocument[]>> {
    const courseUnit = await this.ensureCourseUnitExists(courseUnitId);
    const actor = await this.ensureActor(queryDto.viewerUserId);
    await this.ensureCanViewCourseUnitGrades(actor, courseUnit);

    const query: Record<string, unknown> = { courseUnitId: courseUnit._id };

    if (queryDto.status) {
      query.status = queryDto.status;
    }

    if (queryDto.publishedOnly) {
      query.status = GradeStatus.PUBLISHED;
      query.visibleToStudent = true;
    }

    const grades = await this.gradeModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      data: grades,
    };
  }

  remove(gradeId: string): never {
    void gradeId;
    throw new ConflictException('Grades cannot be deleted once entered');
  }

  private async ensureGradeExists(id: string): Promise<GradeDocument> {
    this.validateObjectId(id);
    const grade = await this.gradeModel.findById(id).exec();
    if (!grade) {
      throw new NotFoundException(`Grade with id ${id} was not found`);
    }
    return grade;
  }

  private async ensureActor(userId: string): Promise<ActorContext> {
    const user = await this.ensureUserExists(userId);
    const lecturer = await this.lecturerModel
      .findOne({ userId: user._id })
      .exec();

    return {
      user,
      lecturer: lecturer ?? undefined,
    };
  }

  private async ensureUserExists(userId: string): Promise<UserDocument> {
    this.validateObjectId(userId);
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${userId} was not found`);
    }
    return user;
  }

  private async ensureStudentExists(id: string): Promise<StudentDocument> {
    this.validateObjectId(id);
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with id ${id} was not found`);
    }
    return student;
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

  private async ensureExamExists(id: string): Promise<ExamDocument> {
    this.validateObjectId(id);
    const exam = await this.examModel.findById(id).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${id} was not found`);
    }
    return exam;
  }

  private async ensureCourseExists(id: string): Promise<CourseDocument> {
    this.validateObjectId(id);
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with id ${id} was not found`);
    }
    return course;
  }

  private async ensureCanEnterGrade(
    actor: ActorContext,
    courseUnit: CourseUnitDocument,
  ): Promise<void> {
    if (actor.user.role === UserRole.ADMIN) {
      return;
    }

    if (actor.user.role !== UserRole.LECTURER || !actor.lecturer) {
      throw new ForbiddenException('Only lecturers may create grades');
    }

    if (this.isAssignedLecturer(actor.lecturer, courseUnit)) {
      return;
    }

    if (await this.isHodForCourseUnit(actor.lecturer, courseUnit)) {
      return;
    }

    throw new ForbiddenException('You are not assigned to this course unit');
  }

  private ensureCanSubmitGrade(
    actor: ActorContext,
    grade: GradeDocument,
    courseUnit: CourseUnitDocument,
  ): void {
    if (actor.user.role !== UserRole.LECTURER || !actor.lecturer) {
      throw new ForbiddenException('Only lecturers may submit grades');
    }

    if (grade.enteredBy.toString() === actor.user._id.toString()) {
      return;
    }

    if (this.isAssignedLecturer(actor.lecturer, courseUnit)) {
      return;
    }

    throw new ForbiddenException('You are not assigned to this course unit');
  }

  private async ensureCanModerateGrade(
    actor: ActorContext,
    courseUnit: CourseUnitDocument,
  ): Promise<void> {
    if (actor.user.role === UserRole.ADMIN) {
      return;
    }

    if (
      actor.user.role === UserRole.LECTURER &&
      actor.lecturer &&
      (await this.isHodForCourseUnit(actor.lecturer, courseUnit))
    ) {
      return;
    }

    throw new ForbiddenException('Only the department HOD may moderate grades');
  }

  private async ensureCanViewStudentGrades(
    actor: ActorContext,
    student: StudentDocument,
  ): Promise<boolean> {
    if (
      [UserRole.ADMIN, UserRole.REGISTRAR, UserRole.LECTURER].includes(
        actor.user.role,
      )
    ) {
      return true;
    }

    if (actor.user.role === UserRole.STUDENT) {
      if (student.userId.toString() !== actor.user._id.toString()) {
        throw new ForbiddenException(
          'Students may only access their own grades',
        );
      }
      return false;
    }

    if (actor.user.role === UserRole.PARENT) {
      const parent = await this.parentModel
        .findOne({ userId: actor.user._id })
        .exec();
      if (!parent) {
        throw new ForbiddenException('Parent profile was not found');
      }

      const link = await this.parentStudentLinkModel
        .findOne({
          parentId: parent._id,
          studentId: student._id,
          canViewAcademics: true,
        })
        .exec();

      if (!link) {
        throw new ForbiddenException(
          'Parent is not allowed to view this student grades',
        );
      }

      return false;
    }

    throw new ForbiddenException('User is not allowed to view student grades');
  }

  private async ensureCanViewCourseUnitGrades(
    actor: ActorContext,
    courseUnit: CourseUnitDocument,
  ): Promise<void> {
    if ([UserRole.ADMIN, UserRole.REGISTRAR].includes(actor.user.role)) {
      return;
    }

    if (actor.user.role === UserRole.LECTURER && actor.lecturer) {
      if (this.isAssignedLecturer(actor.lecturer, courseUnit)) {
        return;
      }

      if (await this.isHodForCourseUnit(actor.lecturer, courseUnit)) {
        return;
      }
    }

    throw new ForbiddenException(
      'User is not allowed to view grades for this course unit',
    );
  }

  private async isHodForCourseUnit(
    lecturer: LecturerDocument,
    courseUnit: CourseUnitDocument,
  ): Promise<boolean> {
    const course = await this.ensureCourseExists(
      courseUnit.courseId.toString(),
    );
    const department = await this.departmentModel
      .findById(course.departmentId)
      .exec();

    return department?.hodId?.toString() === lecturer._id.toString();
  }

  private isAssignedLecturer(
    lecturer: LecturerDocument,
    courseUnit: CourseUnitDocument,
  ): boolean {
    return courseUnit.lecturerId?.toString() === lecturer._id.toString();
  }

  private async ensureStudentEnrolled(
    studentId: Types.ObjectId,
    courseUnitId: Types.ObjectId,
  ): Promise<void> {
    const enrollmentCount = await this.enrollmentModel
      .countDocuments({
        studentId,
        courseUnitId,
        status: EnrollmentStatus.ACTIVE,
      })
      .exec();

    if (enrollmentCount === 0) {
      throw new ForbiddenException(
        'Student is not enrolled in this course unit',
      );
    }
  }

  private ensureExamBelongsToCourseUnit(
    exam: ExamDocument,
    courseUnit: CourseUnitDocument,
  ): void {
    if (exam.courseUnitId.toString() !== courseUnit._id.toString()) {
      throw new BadRequestException('Exam does not belong to this course unit');
    }
  }

  private validateMarks(marksScored: number, exam: ExamDocument): void {
    if (marksScored > exam.totalMarks) {
      throw new BadRequestException(
        'Marks scored cannot exceed exam total marks',
      );
    }
  }

  private calculateGrade(marksScored: number): GradeScaleResult {
    if (marksScored >= 70) {
      return { grade: 'A', GPAContribution: 4.0 };
    }
    if (marksScored >= 60) {
      return { grade: 'B+', GPAContribution: 3.5 };
    }
    if (marksScored >= 50) {
      return { grade: 'B', GPAContribution: 3.0 };
    }
    if (marksScored >= 40) {
      return { grade: 'C', GPAContribution: 2.0 };
    }
    if (marksScored >= 35) {
      return { grade: 'D', GPAContribution: 1.0 };
    }
    return { grade: 'F', GPAContribution: 0.0 };
  }

  private ensureNoDuplicateStudentsInPayload(studentIds: string[]): void {
    const seen = new Set<string>();
    for (const studentId of studentIds) {
      if (seen.has(studentId)) {
        throw new ConflictException(
          'Duplicate student grades are not allowed in one bulk request',
        );
      }
      seen.add(studentId);
    }
  }

  private async resolveCourseUnitIdsForSemester(
    semesterId: string,
    courseUnitId?: string,
  ): Promise<Types.ObjectId[]> {
    this.validateObjectId(semesterId);

    if (courseUnitId) {
      const courseUnit = await this.ensureCourseUnitExists(courseUnitId);
      if (courseUnit.semesterId.toString() !== semesterId) {
        return [];
      }
      return [courseUnit._id];
    }

    const courseUnits = await this.courseUnitModel.find({ semesterId }).exec();
    return courseUnits.map((courseUnit) => courseUnit._id);
  }

  private async createPublicationNotifications(
    grade: GradeDocument,
  ): Promise<void> {
    const student = await this.ensureStudentExists(grade.studentId.toString());
    const notifications = [
      {
        userId: student.userId,
        title: 'Grade published',
        message: 'A new grade has been published for your account.',
        type: NotificationType.ACADEMIC,
        isRead: false,
      },
    ];

    const parentLinks = await this.parentStudentLinkModel
      .find({
        studentId: student._id,
        canReceiveNotifications: true,
        canViewAcademics: true,
      })
      .exec();
    const parentIds = parentLinks.map((link) => link.parentId);

    if (parentIds.length > 0) {
      const parents = await this.parentModel
        .find({ _id: { $in: parentIds } })
        .exec();
      for (const parent of parents) {
        notifications.push({
          userId: parent.userId,
          title: 'Student grade published',
          message: 'A new academic grade has been published for your student.',
          type: NotificationType.ACADEMIC,
          isRead: false,
        });
      }
    }

    await this.notificationModel.create(notifications);
  }

  private async recordAuditLog(
    userId: string | Types.ObjectId,
    action: string,
    metadata: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<AuditLogDocument> {
    const auditLog = new this.auditLogModel({
      userId: new Types.ObjectId(userId.toString()),
      action,
      module: 'grades',
      metadata,
      ipAddress,
    });

    return auditLog.save();
  }

  private toIdentifierResponse(
    grade: GradeDocument,
  ): GradeIdentifierResponseDto {
    return {
      gradeId: grade._id.toString(),
      status: grade.status,
    };
  }

  private toAuditSnapshot(grade: GradeDocument): GradeAuditSnapshot {
    return {
      marksScored: grade.marksScored,
      grade: grade.grade,
      GPAContribution: grade.GPAContribution,
      remarks: grade.remarks,
      status: grade.status,
      visibleToStudent: grade.visibleToStudent,
    };
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
