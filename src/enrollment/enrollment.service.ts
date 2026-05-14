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
  CourseUnit,
  CourseUnitDocument,
} from '../course-unit/entities/course-unit.entity';
import { Course } from '../course/entities/course.entity';
import {
  Semester,
  SemesterDocument,
} from '../semester/entities/semester.entity';
import { Student, StudentDocument } from '../student/entities/student.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { RegisterCourseDto } from './dto/register-course.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from './entities/enrollment.entity';

interface EnrollmentUpdateFields {
  studentId?: Types.ObjectId;
  courseUnitId?: Types.ObjectId;
  semesterId?: Types.ObjectId;
  enrollmentDate?: Date;
  status?: EnrollmentStatus;
}

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(CourseUnit.name)
    private readonly courseUnitModel: Model<CourseUnit>,
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<Semester>,
  ) {}

  async registerCourse(
    registerCourseDto: RegisterCourseDto,
  ): Promise<StudentDocument> {
    const student = await this.resolveStudent(registerCourseDto.studentId);
    const courseId = await this.resolveCourseId(registerCourseDto.courseId);
    const semester = registerCourseDto.semesterId
      ? await this.resolveSemester(registerCourseDto.semesterId)
      : await this.resolveActiveSemester();

    if (!semester.isActive) {
      throw new ConflictException(
        'Course registration can only use the current active semester',
      );
    }

    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(
        student._id,
        {
          courseId,
          semesterId: semester._id,
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedStudent) {
      throw new NotFoundException(
        `Student with id ${registerCourseDto.studentId} was not found`,
      );
    }

    return updatedStudent;
  }

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<EnrollmentDocument> {
    try {
      const { student, courseUnit, semester } =
        await this.resolveEnrollmentRelations(createEnrollmentDto);

      const enrollment = new this.enrollmentModel({
        studentId: student._id,
        courseUnitId: courseUnit._id,
        semesterId: semester._id,
        enrollmentDate: createEnrollmentDto.enrollmentDate
          ? new Date(createEnrollmentDto.enrollmentDate)
          : undefined,
        status: createEnrollmentDto.status ?? EnrollmentStatus.ACTIVE,
      });

      return await enrollment.save();
    } catch (error: unknown) {
      this.logger.error('Enrollment creation failed', error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Student is already enrolled in this course unit for the semester',
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<EnrollmentDocument[]> {
    return this.enrollmentModel.find().exec();
  }

  async findOne(id: string): Promise<EnrollmentDocument> {
    this.validateObjectId(id);

    const enrollment = await this.enrollmentModel.findById(id).exec();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id ${id} was not found`);
    }

    return enrollment;
  }

  async update(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentDocument> {
    this.validateObjectId(id);

    try {
      const existingEnrollment = await this.findOne(id);
      const updateFields = await this.buildUpdateFields(
        existingEnrollment,
        updateEnrollmentDto,
      );

      const updatedEnrollment = await this.enrollmentModel
        .findByIdAndUpdate(id, updateFields, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedEnrollment) {
        throw new NotFoundException(`Enrollment with id ${id} was not found`);
      }

      return updatedEnrollment;
    } catch (error: unknown) {
      this.logger.error(`Enrollment update failed for ${id}`, error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Student is already enrolled in this course unit for the semester',
        );
      }

      throw error;
    }
  }

  async remove(id: string): Promise<never> {
    this.validateObjectId(id);
    await this.findOne(id);

    throw new ConflictException('Enrollments cannot be deleted once created');
  }

  private async buildUpdateFields(
    existingEnrollment: EnrollmentDocument,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentUpdateFields> {
    const nextEnrollment = {
      studentId:
        updateEnrollmentDto.studentId ??
        existingEnrollment.studentId.toString(),
      courseUnitId:
        updateEnrollmentDto.courseUnitId ??
        existingEnrollment.courseUnitId.toString(),
      semesterId:
        updateEnrollmentDto.semesterId ??
        existingEnrollment.semesterId.toString(),
    };
    const { student, courseUnit, semester } =
      await this.resolveEnrollmentRelations(nextEnrollment);
    const updateFields: EnrollmentUpdateFields = {
      studentId: student._id,
      courseUnitId: courseUnit._id,
      semesterId: semester._id,
    };

    if (updateEnrollmentDto.enrollmentDate !== undefined) {
      updateFields.enrollmentDate = new Date(
        updateEnrollmentDto.enrollmentDate,
      );
    }

    if (updateEnrollmentDto.status !== undefined) {
      updateFields.status = updateEnrollmentDto.status;
    }

    return updateFields;
  }

  private async resolveEnrollmentRelations(
    enrollmentDto: Pick<
      CreateEnrollmentDto,
      'studentId' | 'courseUnitId' | 'semesterId'
    >,
  ): Promise<{
    student: StudentDocument;
    courseUnit: CourseUnitDocument;
    semester: SemesterDocument;
  }> {
    const [student, courseUnit, semester, activeSemester] = await Promise.all([
      this.resolveStudent(enrollmentDto.studentId),
      this.resolveCourseUnit(enrollmentDto.courseUnitId),
      this.resolveSemester(enrollmentDto.semesterId),
      this.resolveActiveSemester(),
    ]);

    if (!courseUnit.lecturerId) {
      throw new ConflictException(
        'Course unit must have an assigned lecturer before enrollment',
      );
    }

    if (!courseUnit.semesterId.equals(activeSemester._id)) {
      throw new ConflictException(
        'Course unit is not open for the current semester',
      );
    }

    if (!semester._id.equals(activeSemester._id)) {
      throw new ConflictException(
        'Enrollments can only be created for the current active semester',
      );
    }

    if (!courseUnit.semesterId.equals(semester._id)) {
      throw new ConflictException(
        'Course unit does not belong to the requested semester',
      );
    }

    if (!student.courseId.equals(courseUnit.courseId)) {
      throw new ConflictException(
        'Student must register for the course before registering for its units',
      );
    }

    return { student, courseUnit, semester };
  }

  private async resolveStudent(studentId: string): Promise<StudentDocument> {
    this.validateObjectId(studentId);

    const student = await this.studentModel.findById(studentId).exec();

    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} was not found`);
    }

    return student;
  }

  private async resolveCourseId(courseId: string): Promise<Types.ObjectId> {
    this.validateObjectId(courseId);

    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with id ${courseId} was not found`);
    }

    return course._id;
  }

  private async resolveCourseUnit(
    courseUnitId: string,
  ): Promise<CourseUnitDocument> {
    this.validateObjectId(courseUnitId);

    const courseUnit = await this.courseUnitModel.findById(courseUnitId).exec();

    if (!courseUnit) {
      throw new NotFoundException(
        `Course unit with id ${courseUnitId} was not found`,
      );
    }

    return courseUnit;
  }

  private async resolveSemester(semesterId: string): Promise<SemesterDocument> {
    this.validateObjectId(semesterId);

    const semester = await this.semesterModel.findById(semesterId).exec();

    if (!semester) {
      throw new NotFoundException(
        `Semester with id ${semesterId} was not found`,
      );
    }

    return semester;
  }

  private async resolveActiveSemester(): Promise<SemesterDocument> {
    const semester = await this.semesterModel
      .findOne({ isActive: true })
      .exec();

    if (!semester) {
      throw new BadRequestException('No active semester is configured');
    }

    return semester;
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
      error.code === 11000
    );
  }
}
