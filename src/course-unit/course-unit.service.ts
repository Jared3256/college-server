import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assessment } from '../assessment/entities/assessment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { Semester } from '../semester/entities/semester.entity';
import { CreateCourseUnitDto } from './dto/create-course-unit.dto';
import { UpdateCourseUnitDto } from './dto/update-course-unit.dto';
import { CourseUnit, CourseUnitDocument } from './entities/course-unit.entity';

interface CourseUnitUpdateFields {
  courseId?: Types.ObjectId;
  lecturerId?: Types.ObjectId;
  semesterId?: Types.ObjectId;
  unitName?: string;
  unitCode?: string;
  creditHours?: number;
  description?: string;
}

@Injectable()
export class CourseUnitService {
  private readonly logger = new Logger(CourseUnitService.name);

  constructor(
    @InjectModel(CourseUnit.name)
    private readonly courseUnitModel: Model<CourseUnit>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<Semester>,
    @InjectModel(Lecturer.name)
    private readonly lecturerModel: Model<Lecturer>,
    @InjectModel(Assessment.name)
    private readonly assessmentModel: Model<Assessment>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
  ) {}

  async create(
    createCourseUnitDto: CreateCourseUnitDto,
  ): Promise<CourseUnitDocument> {
    try {
      const courseId = await this.resolveCourseId(createCourseUnitDto);
      const semesterId = await this.resolveSemesterId(
        createCourseUnitDto.semesterId,
      );
      const lecturerId = await this.resolveLecturerId(
        createCourseUnitDto.lecturerId,
      );

      await this.ensureDistinctUnit(
        createCourseUnitDto.unitName,
        createCourseUnitDto.unitCode,
      );

      const courseUnit = new this.courseUnitModel({
        courseId,
        lecturerId,
        semesterId,
        unitName: createCourseUnitDto.unitName,
        unitCode: createCourseUnitDto.unitCode.toUpperCase(),
        creditHours: createCourseUnitDto.creditHours,
        description: createCourseUnitDto.description,
      });

      return await courseUnit.save();
    } catch (error: unknown) {
      this.logger.error('Course unit creation failed', error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A course unit with the supplied name or code already exists',
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<CourseUnitDocument[]> {
    return this.courseUnitModel.find().exec();
  }

  async findOne(id: string): Promise<CourseUnitDocument> {
    this.validateObjectId(id);

    const courseUnit = await this.courseUnitModel.findById(id).exec();

    if (!courseUnit) {
      throw new NotFoundException(`Course unit with id ${id} was not found`);
    }

    return courseUnit;
  }

  async update(
    id: string,
    updateCourseUnitDto: UpdateCourseUnitDto,
  ): Promise<CourseUnitDocument> {
    this.validateObjectId(id);

    try {
      const updateFields = await this.buildUpdateFields(updateCourseUnitDto);

      if (updateCourseUnitDto.unitName || updateCourseUnitDto.unitCode) {
        await this.ensureDistinctUnit(
          updateCourseUnitDto.unitName,
          updateCourseUnitDto.unitCode,
          id,
        );
      }

      const courseUnit = await this.courseUnitModel
        .findByIdAndUpdate(id, updateFields, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!courseUnit) {
        throw new NotFoundException(`Course unit with id ${id} was not found`);
      }

      return courseUnit;
    } catch (error: unknown) {
      this.logger.error(`Course unit update failed for ${id}`, error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A course unit with the supplied name or code already exists',
        );
      }

      throw error;
    }
  }

  async remove(id: string): Promise<CourseUnitDocument> {
    this.validateObjectId(id);

    const courseUnit = await this.findOne(id);
    await this.ensureCanDelete(courseUnit);

    const deletedCourseUnit = await this.courseUnitModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCourseUnit) {
      throw new NotFoundException(`Course unit with id ${id} was not found`);
    }

    return deletedCourseUnit;
  }

  private async buildUpdateFields(
    updateCourseUnitDto: UpdateCourseUnitDto,
  ): Promise<CourseUnitUpdateFields> {
    const updateFields: CourseUnitUpdateFields = {};

    if (updateCourseUnitDto.courseId || updateCourseUnitDto.courseCode) {
      updateFields.courseId = await this.resolveCourseId(updateCourseUnitDto);
    }

    if (updateCourseUnitDto.lecturerId) {
      updateFields.lecturerId = await this.resolveLecturerId(
        updateCourseUnitDto.lecturerId,
      );
    }

    if (updateCourseUnitDto.semesterId) {
      updateFields.semesterId = await this.resolveSemesterId(
        updateCourseUnitDto.semesterId,
      );
    }

    if (updateCourseUnitDto.unitName !== undefined) {
      updateFields.unitName = updateCourseUnitDto.unitName;
    }

    if (updateCourseUnitDto.unitCode !== undefined) {
      updateFields.unitCode = updateCourseUnitDto.unitCode.toUpperCase();
    }

    if (updateCourseUnitDto.creditHours !== undefined) {
      updateFields.creditHours = updateCourseUnitDto.creditHours;
    }

    if (updateCourseUnitDto.description !== undefined) {
      updateFields.description = updateCourseUnitDto.description;
    }

    return updateFields;
  }

  private async resolveCourseId(
    courseUnitDto: Pick<CreateCourseUnitDto, 'courseId' | 'courseCode'>,
  ): Promise<Types.ObjectId> {
    if (courseUnitDto.courseId) {
      this.validateObjectId(courseUnitDto.courseId);
      const course = await this.courseModel
        .findById(courseUnitDto.courseId)
        .exec();

      if (!course) {
        throw new NotFoundException(
          `Course with id ${courseUnitDto.courseId} was not found`,
        );
      }

      return course._id;
    }

    if (!courseUnitDto.courseCode) {
      throw new BadRequestException('A courseId or courseCode is required');
    }

    const course = await this.courseModel
      .findOne({ courseCode: courseUnitDto.courseCode.toUpperCase() })
      .exec();

    if (!course) {
      throw new NotFoundException(
        `Course with code ${courseUnitDto.courseCode} was not found`,
      );
    }

    return course._id;
  }

  private async resolveSemesterId(semesterId: string): Promise<Types.ObjectId> {
    this.validateObjectId(semesterId);

    const semester = await this.semesterModel.findById(semesterId).exec();

    if (!semester) {
      throw new NotFoundException(
        `Semester with id ${semesterId} was not found`,
      );
    }

    return semester._id;
  }

  private async resolveLecturerId(
    lecturerId?: string,
  ): Promise<Types.ObjectId | undefined> {
    if (!lecturerId) {
      return undefined;
    }

    this.validateObjectId(lecturerId);

    const lecturer = await this.lecturerModel.findById(lecturerId).exec();

    if (!lecturer) {
      throw new NotFoundException(
        `Lecturer with id ${lecturerId} was not found`,
      );
    }

    return lecturer._id;
  }

  private async ensureDistinctUnit(
    unitName?: string,
    unitCode?: string,
    excludedId?: string,
  ): Promise<void> {
    if (unitName) {
      await this.ensureNoDuplicateUnitField('unitName', unitName, excludedId);
    }

    if (unitCode) {
      await this.ensureNoDuplicateUnitField(
        'unitCode',
        unitCode.toUpperCase(),
        excludedId,
      );
    }
  }

  private async ensureNoDuplicateUnitField(
    field: 'unitName' | 'unitCode',
    value: string,
    excludedId?: string,
  ): Promise<void> {
    const duplicate = await this.courseUnitModel
      .findOne({
        [field]: value,
        ...(excludedId ? { _id: { $ne: excludedId } } : {}),
      })
      .exec();

    if (duplicate) {
      throw new ConflictException('Course unit name and code must be distinct');
    }
  }

  private async ensureCanDelete(courseUnit: CourseUnitDocument): Promise<void> {
    if (courseUnit.lecturerId) {
      throw new ConflictException(
        'Course unit cannot be deleted while a lecturer is assigned',
      );
    }

    const [assessmentCount, attendanceCount, enrollmentCount] =
      await Promise.all([
        this.assessmentModel
          .countDocuments({ courseUnitId: courseUnit._id })
          .exec(),
        this.attendanceModel
          .countDocuments({ courseUnitId: courseUnit._id })
          .exec(),
        this.enrollmentModel
          .countDocuments({ courseUnitId: courseUnit._id })
          .exec(),
      ]);

    if (assessmentCount > 0 || attendanceCount > 0 || enrollmentCount > 0) {
      throw new ConflictException(
        'Course unit cannot be deleted while assessments, attendance, or enrollments are attached',
      );
    }
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
