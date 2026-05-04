import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { randomBytes, scryptSync } from 'node:crypto';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { Department } from '../department/entities/department.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { Lecturer, LecturerDocument } from './entities/lecturer.entity';

interface LecturerUpdateFields {
  userId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  specialization?: string;
  employmentDate?: Date;
}

@Injectable()
export class LecturerService {
  private readonly logger = new Logger(LecturerService.name);

  constructor(
    @InjectModel(Lecturer.name)
    private readonly lecturerModel: Model<Lecturer>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async create(
    createLecturerDto: CreateLecturerDto,
  ): Promise<LecturerDocument> {
    const session = await this.connection.startSession();

    try {
      let lecturer: LecturerDocument | null = null;

      await session.withTransaction(async () => {
        const departmentId = await this.resolveDepartmentId(
          createLecturerDto.departmentId,
          session,
        );
        const userId = await this.resolveUserId(createLecturerDto, session);
        const employmentDate = createLecturerDto.employmentDate
          ? new Date(createLecturerDto.employmentDate)
          : new Date();
        const staffNumber = await this.generateStaffNumber(
          employmentDate.getFullYear(),
          session,
        );

        const [createdLecturer] = await this.lecturerModel.create(
          [
            {
              userId,
              staffNumber,
              departmentId,
              specialization: createLecturerDto.specialization,
              employmentDate,
            },
          ],
          { session },
        );

        lecturer = createdLecturer;
      });

      if (!lecturer) {
        throw new BadRequestException(
          'Lecturer registration was not completed',
        );
      }

      return lecturer;
    } catch (error: unknown) {
      this.logger.error('Lecturer registration failed', error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A lecturer or user with the supplied unique details already exists',
        );
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findAll(): Promise<LecturerDocument[]> {
    return this.lecturerModel.find().exec();
  }

  async findOne(id: string): Promise<LecturerDocument> {
    this.validateObjectId(id);

    const lecturer = await this.lecturerModel.findById(id).exec();

    if (!lecturer) {
      throw new NotFoundException(`Lecturer with id ${id} was not found`);
    }

    return lecturer;
  }

  async update(
    id: string,
    updateLecturerDto: UpdateLecturerDto,
  ): Promise<LecturerDocument> {
    this.validateObjectId(id);

    const existingLecturer = await this.findOne(id);
    const session = await this.connection.startSession();

    try {
      let updatedLecturer: LecturerDocument | null = null;

      await session.withTransaction(async () => {
        if (updateLecturerDto.user) {
          await this.userModel
            .findByIdAndUpdate(
              existingLecturer.userId,
              {
                fullName: updateLecturerDto.user.fullName,
                email: updateLecturerDto.user.email,
                phoneNumber: updateLecturerDto.user.phoneNumber,
                ...(updateLecturerDto.user.password
                  ? {
                      passwordHash: this.hashPassword(
                        updateLecturerDto.user.password,
                      ),
                    }
                  : {}),
              },
              { new: true, runValidators: true, session },
            )
            .exec();
        }

        const updateFields = await this.buildUpdateFields(
          updateLecturerDto,
          session,
        );

        updatedLecturer = await this.lecturerModel
          .findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true,
            session,
          })
          .exec();
      });

      if (!updatedLecturer) {
        throw new NotFoundException(`Lecturer with id ${id} was not found`);
      }

      return updatedLecturer;
    } catch (error: unknown) {
      this.logger.error(`Lecturer update failed for ${id}`, error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A lecturer or user with the supplied unique details already exists',
        );
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string): Promise<LecturerDocument> {
    this.validateObjectId(id);

    const session = await this.connection.startSession();

    try {
      let deletedLecturer: LecturerDocument | null = null;
      await session.withTransaction(async () => {
        const lecturer = await this.lecturerModel
          .findByIdAndDelete(id)
          .session(session)
          .exec();

        if (!lecturer) {
          throw new NotFoundException(`Lecturer with id ${id} was not found`);
        }

        await this.userModel
          .findByIdAndDelete(lecturer.userId)
          .session(session)
          .exec();

        deletedLecturer = lecturer;
      });

      if (!deletedLecturer) {
        throw new NotFoundException(`Lecturer with id ${id} was not found`);
      }

      return deletedLecturer;
    } finally {
      await session.endSession();
    }
  }

  private async buildUpdateFields(
    updateLecturerDto: UpdateLecturerDto,
    session: ClientSession,
  ): Promise<LecturerUpdateFields> {
    const updateFields: LecturerUpdateFields = {};

    if (updateLecturerDto.userId) {
      updateFields.userId = await this.findUserId(
        updateLecturerDto.userId,
        session,
      );
    }

    if (updateLecturerDto.departmentId) {
      updateFields.departmentId = await this.resolveDepartmentId(
        updateLecturerDto.departmentId,
        session,
      );
    }

    if (updateLecturerDto.specialization !== undefined) {
      updateFields.specialization = updateLecturerDto.specialization;
    }

    if (updateLecturerDto.employmentDate !== undefined) {
      updateFields.employmentDate = new Date(updateLecturerDto.employmentDate);
    }

    return updateFields;
  }

  private async resolveUserId(
    createLecturerDto: CreateLecturerDto,
    session: ClientSession,
  ): Promise<Types.ObjectId> {
    if (createLecturerDto.userId) {
      return this.findUserId(createLecturerDto.userId, session);
    }

    if (!createLecturerDto.user) {
      throw new BadRequestException('A userId or user payload is required');
    }

    const [user] = await this.userModel.create(
      [
        {
          fullName: createLecturerDto.user.fullName,
          email: createLecturerDto.user.email,
          phoneNumber: createLecturerDto.user.phoneNumber,
          passwordHash: this.hashPassword(createLecturerDto.user.password),
          role: UserRole.LECTURER,
          isActive: true,
          mfaEnabled: false,
        },
      ],
      { session },
    );

    return user._id;
  }

  private async findUserId(
    userId: string,
    session: ClientSession,
  ): Promise<Types.ObjectId> {
    this.validateObjectId(userId);

    const user = await this.userModel.findById(userId).session(session).exec();

    if (!user) {
      throw new NotFoundException(`User with id ${userId} was not found`);
    }

    return user._id;
  }

  private async resolveDepartmentId(
    departmentId: string,
    session: ClientSession,
  ): Promise<Types.ObjectId> {
    this.validateObjectId(departmentId);

    const department = await this.departmentModel
      .findById(departmentId)
      .session(session)
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Department with id ${departmentId} was not found`,
      );
    }

    return department._id;
  }

  private async generateStaffNumber(
    employmentYear: number,
    session: ClientSession,
  ): Promise<string> {
    const staffNumberPrefix = `KIIST/STAFF/${employmentYear}/`;
    const lecturerCount = await this.lecturerModel
      .countDocuments({
        staffNumber: { $regex: `^${staffNumberPrefix}` },
      })
      .session(session)
      .exec();

    return `${staffNumberPrefix}${String(lecturerCount + 1).padStart(4, '0')}`;
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid MongoDB id: ${id}`);
    }
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hash}`;
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
