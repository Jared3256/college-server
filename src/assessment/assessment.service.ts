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
  Assessment,
  AssessmentDocument,
  AssessmentType,
} from './entities/assessment.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import {
  CourseUnit,
  CourseUnitDocument,
} from '../course-unit/entities/course-unit.entity';
import { Course } from '../course/entities/course.entity';
import { Semester } from '../semester/entities/semester.entity';
import {
  Lecturer,
  LecturerDocument,
} from '../lecturer/entities/lecturer.entity';
import { Grade } from '../grade/entities/grade.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

interface AssessmentUpdateFields {
  courseUnitId?: Types.ObjectId;
  title?: string;
  type?: AssessmentType;
  totalMarks?: number;
  dueDate?: Date;
  createdBy?: Types.ObjectId;
}

interface MongoServerErrorShape {
  code?: number;
}

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @InjectModel(Assessment.name)
    private readonly assessmentModel: Model<Assessment>,
    @InjectModel(CourseUnit.name)
    private readonly courseUnitModel: Model<CourseUnit>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<Semester>,
    @InjectModel(Lecturer.name)
    private readonly lecturerModel: Model<Lecturer>,
    @InjectModel(Grade.name)
    private readonly gradeModel: Model<Grade>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
  ) {}

  async create(createDto: CreateAssessmentDto): Promise<AssessmentDocument> {
    try {
      const courseUnit = await this.resolveCourseUnit(createDto);

      await this.ensureLecturerExists(createDto.createdBy);

      this.validateTypeAndMarks(createDto.type, createDto.totalMarks);

      const assessment = new this.assessmentModel({
        courseUnitId: courseUnit._id,
        title: createDto.title,
        type: createDto.type,
        totalMarks: createDto.totalMarks,
        dueDate: createDto.dueDate ? new Date(createDto.dueDate) : undefined,
        createdBy: new Types.ObjectId(createDto.createdBy),
      });

      return await assessment.save();
    } catch (error: unknown) {
      this.logger.error('Assessment creation failed', error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'An assessment with similar unique fields already exists',
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<AssessmentDocument[]> {
    return this.assessmentModel.find().exec();
  }

  async findOne(id: string): Promise<AssessmentDocument> {
    this.validateObjectId(id);

    const assessment = await this.assessmentModel.findById(id).exec();

    if (!assessment) {
      throw new NotFoundException(`Assessment with id ${id} was not found`);
    }

    return assessment;
  }

  async update(
    id: string,
    updateDto: UpdateAssessmentDto,
  ): Promise<AssessmentDocument> {
    this.validateObjectId(id);

    try {
      const assessment = await this.findOne(id);
      const updateFields = await this.buildUpdateFields(updateDto);
      const nextType = updateFields.type ?? assessment.type;
      const nextMarks = updateFields.totalMarks ?? assessment.totalMarks;

      this.validateTypeAndMarks(nextType, nextMarks);

      const updatedAssessment = await this.assessmentModel
        .findByIdAndUpdate(id, updateFields, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedAssessment) {
        throw new NotFoundException(`Assessment with id ${id} was not found`);
      }

      return updatedAssessment;
    } catch (error: unknown) {
      this.logger.error(`Assessment update failed for ${id}`, error);
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'An assessment with similar unique fields already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<AssessmentDocument> {
    this.validateObjectId(id);

    const assessment = await this.assessmentModel.findById(id).exec();

    if (!assessment) {
      throw new NotFoundException(`Assessment with id ${id} was not found`);
    }

    const gradesCount = await this.gradeModel
      .countDocuments({ assessmentId: assessment._id })
      .exec();
    if (gradesCount > 0) {
      throw new ConflictException(
        'Assessment cannot be deleted: grades are attached',
      );
    }

    const enrollmentsCount = await this.enrollmentModel
      .countDocuments({ courseUnitId: assessment.courseUnitId })
      .exec();
    if (enrollmentsCount > 0) {
      throw new ConflictException(
        'Assessment cannot be deleted: enrollments exist for the course unit',
      );
    }

    const deletedAssessment = await this.assessmentModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedAssessment) {
      throw new NotFoundException(`Assessment with id ${id} was not found`);
    }

    return deletedAssessment;
  }

  private async buildUpdateFields(
    updateDto: UpdateAssessmentDto,
  ): Promise<AssessmentUpdateFields> {
    const updateFields: AssessmentUpdateFields = {};

    if (updateDto.courseUnitId || updateDto.unitCode || updateDto.courseUnit) {
      updateFields.courseUnitId = (await this.resolveCourseUnit(updateDto))._id;
    }

    if (updateDto.title !== undefined) {
      updateFields.title = updateDto.title;
    }

    if (updateDto.type !== undefined) {
      updateFields.type = updateDto.type;
    }

    if (updateDto.totalMarks !== undefined) {
      updateFields.totalMarks = updateDto.totalMarks;
    }

    if (updateDto.dueDate !== undefined) {
      updateFields.dueDate = new Date(updateDto.dueDate);
    }

    if (updateDto.createdBy !== undefined) {
      updateFields.createdBy = (
        await this.ensureLecturerExists(updateDto.createdBy)
      )._id;
    }

    return updateFields;
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid MongoDB id: ${id}`);
    }
  }

  private async resolveCourseUnit(
    assessmentDto: Pick<
      CreateAssessmentDto,
      'courseUnitId' | 'unitCode' | 'courseUnit'
    >,
  ): Promise<CourseUnitDocument> {
    if (assessmentDto.courseUnitId) {
      this.validateObjectId(assessmentDto.courseUnitId);
      return this.courseUnitModel
        .findById(assessmentDto.courseUnitId)
        .orFail(
          () =>
            new NotFoundException(
              `Course unit with id ${assessmentDto.courseUnitId} was not found`,
            ),
        )
        .exec();
    }

    if (assessmentDto.unitCode) {
      const courseUnit = await this.courseUnitModel
        .findOne({ unitCode: assessmentDto.unitCode.toUpperCase() })
        .exec();

      if (courseUnit) {
        return courseUnit;
      }

      throw new NotFoundException(
        `Course unit with code ${assessmentDto.unitCode} was not found`,
      );
    }

    if (assessmentDto.courseUnit) {
      const payload = assessmentDto.courseUnit;
      const unitCode = payload.unitCode.toUpperCase();
      const existingCourseUnit = await this.courseUnitModel
        .findOne({ unitCode })
        .exec();

      if (existingCourseUnit) {
        return existingCourseUnit;
      }

      const courseId = await this.resolveCourseId(payload);
      const semesterId = await this.resolveSemesterId(payload.semesterId);
      const lecturerId = await this.resolveLecturerId(payload.lecturerId);

      const courseUnit = new this.courseUnitModel({
        courseId,
        lecturerId,
        semesterId,
        unitName: payload.unitName,
        unitCode,
        creditHours: payload.creditHours,
      });

      return courseUnit.save();
    }

    throw new BadRequestException(
      'A valid courseUnitId, unitCode, or nested courseUnit payload is required',
    );
  }

  private async ensureLecturerExists(
    lecturerId: string,
  ): Promise<LecturerDocument> {
    this.validateObjectId(lecturerId);
    return this.lecturerModel
      .findById(lecturerId)
      .orFail(() => new BadRequestException('createdBy lecturer was not found'))
      .exec();
  }

  private async resolveCourseId(
    courseUnitDto: NonNullable<CreateAssessmentDto['courseUnit']>,
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
      throw new BadRequestException(
        'Nested courseUnit requires courseId or courseCode',
      );
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

    return (await this.ensureLecturerExists(lecturerId))._id;
  }

  private validateTypeAndMarks(type: AssessmentType, totalMarks: number): void {
    if (type === AssessmentType.CAT) {
      if (totalMarks > 30) {
        throw new BadRequestException('CAT total marks cannot exceed 30');
      }
    } else if (type === AssessmentType.MAIN) {
      if (totalMarks > 70) {
        throw new BadRequestException('MAIN total marks cannot exceed 70');
      }
    } else {
      throw new BadRequestException('Assessment type must be CAT or MAIN');
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
