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
  Department,
  DepartmentDocument,
} from '../department/entities/department.entity';
import { Course, CourseDocument } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    try {
      const department = await this.resolveDepartment(createCourseDto);
      const course = new this.courseModel({
        departmentId: department._id,
        courseName: createCourseDto.courseName,
        courseCode: createCourseDto.courseCode.toUpperCase(),
        durationYears: createCourseDto.durationYears,
        description: createCourseDto.description,
      });

      return await course.save();
    } catch (error: unknown) {
      this.logger.error('Course creation failed', error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A course with the supplied code already exists',
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.courseModel.find().exec();
  }

  async findOne(id: string): Promise<CourseDocument> {
    this.validateObjectId(id);

    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with id ${id} was not found`);
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDocument> {
    this.validateObjectId(id);

    try {
      const department = await this.resolveDepartmentForUpdate(updateCourseDto);
      const course = await this.courseModel
        .findByIdAndUpdate(
          id,
          {
            departmentId: department?._id ?? updateCourseDto.departmentId,
            courseName: updateCourseDto.courseName,
            courseCode: updateCourseDto.courseCode?.toUpperCase(),
            durationYears: updateCourseDto.durationYears,
            description: updateCourseDto.description,
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!course) {
        throw new NotFoundException(`Course with id ${id} was not found`);
      }

      return course;
    } catch (error: unknown) {
      this.logger.error(`Course update failed for ${id}`, error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A course with the supplied code already exists',
        );
      }

      throw error;
    }
  }

  async remove(id: string): Promise<CourseDocument> {
    this.validateObjectId(id);

    const course = await this.courseModel.findByIdAndDelete(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with id ${id} was not found`);
    }

    return course;
  }

  private async resolveDepartment(
    createCourseDto: CreateCourseDto,
  ): Promise<DepartmentDocument> {
    if (createCourseDto.departmentId) {
      return this.findDepartmentById(createCourseDto.departmentId);
    }

    if (!createCourseDto.department) {
      throw new BadRequestException(
        'A departmentId or department payload is required',
      );
    }

    return this.departmentModel
      .findOneAndUpdate(
        { code: createCourseDto.department.code.toUpperCase() },
        { $setOnInsert: createCourseDto.department },
        { new: true, upsert: true, runValidators: true },
      )
      .orFail(() => new BadRequestException('Department could not be resolved'))
      .exec();
  }

  private async resolveDepartmentForUpdate(
    updateCourseDto: UpdateCourseDto,
  ): Promise<DepartmentDocument | null> {
    if (updateCourseDto.departmentId) {
      return this.findDepartmentById(updateCourseDto.departmentId);
    }

    if (!updateCourseDto.department) {
      return null;
    }

    return this.departmentModel
      .findOneAndUpdate(
        { code: updateCourseDto.department.code.toUpperCase() },
        { $setOnInsert: updateCourseDto.department },
        { new: true, upsert: true, runValidators: true },
      )
      .orFail(() => new BadRequestException('Department could not be resolved'))
      .exec();
  }

  private async findDepartmentById(id: string): Promise<DepartmentDocument> {
    this.validateObjectId(id);

    return this.departmentModel
      .findById(id)
      .orFail(
        () => new NotFoundException(`Department with id ${id} was not found`),
      )
      .exec();
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
