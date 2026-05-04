import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department, DepartmentDocument } from './entities/department.entity';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectModel(Lecturer.name)
    private readonly lecturerModel: Model<Lecturer>,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentDocument> {
    try {
      await this.ensureHeadOfDepartmentExists(createDepartmentDto.hodId);

      const department = new this.departmentModel({
        ...createDepartmentDto,
        code: createDepartmentDto.code.toUpperCase(),
      });

      return await department.save();
    } catch (error: unknown) {
      this.logger.error('Department creation failed', error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A department with the supplied name or code already exists',
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<DepartmentDocument[]> {
    return this.departmentModel.find().exec();
  }

  async findOne(id: string): Promise<DepartmentDocument> {
    this.validateObjectId(id);

    const department = await this.departmentModel.findById(id).exec();

    if (!department) {
      throw new NotFoundException(`Department with id ${id} was not found`);
    }

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentDocument> {
    this.validateObjectId(id);

    try {
      await this.ensureHeadOfDepartmentExists(updateDepartmentDto.hodId);

      const department = await this.departmentModel
        .findByIdAndUpdate(
          id,
          {
            ...updateDepartmentDto,
            code: updateDepartmentDto.code?.toUpperCase(),
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!department) {
        throw new NotFoundException(`Department with id ${id} was not found`);
      }

      return department;
    } catch (error: unknown) {
      this.logger.error(`Department update failed for ${id}`, error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A department with the supplied name or code already exists',
        );
      }

      throw error;
    }
  }

  async remove(id: string): Promise<DepartmentDocument> {
    this.validateObjectId(id);

    const department = await this.departmentModel.findByIdAndDelete(id).exec();

    if (!department) {
      throw new NotFoundException(`Department with id ${id} was not found`);
    }

    return department;
  }

  private async ensureHeadOfDepartmentExists(hodId?: string): Promise<void> {
    if (!hodId) {
      return;
    }

    this.validateObjectId(hodId);

    const lecturerExists = await this.lecturerModel.exists({ _id: hodId }).exec();

    if (!lecturerExists) {
      throw new BadRequestException(
        `Lecturer with id ${hodId} cannot be assigned as head of department`,
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
