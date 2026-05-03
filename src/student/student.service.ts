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
import { Course, CourseDocument } from '../course/entities/course.entity';
import {
  Department,
  DepartmentDocument,
} from '../department/entities/department.entity';
import {
  Semester,
  SemesterDocument,
} from '../semester/entities/semester.entity';
import { User, UserDocument, UserRole } from '../user/entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument } from './entities/student.entity';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<Semester>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    const session = await this.connection.startSession();

    try {
      let student: StudentDocument | null = null;

      await session.withTransaction(async () => {
        const department = await this.resolveDepartment(
          createStudentDto,
          session,
        );
        const course = await this.resolveCourse(
          createStudentDto,
          department._id,
          session,
        );
        const semester = await this.resolveSemester(createStudentDto, session);
        const user = await this.createStudentUser(createStudentDto, session);

        const [createdStudent] = await this.studentModel.create(
          [
            {
              userId: user._id,
              admissionNumber: createStudentDto.admissionNumber,
              nationalId: createStudentDto.nationalId,
              gender: createStudentDto.gender,
              dateOfBirth: createStudentDto.dateOfBirth
                ? new Date(createStudentDto.dateOfBirth)
                : undefined,
              courseId: course._id,
              departmentId: department._id,
              semesterId: semester?._id,
              currentYear: createStudentDto.currentYear,
              guardianContacts: createStudentDto.guardianContacts ?? [],
              address: createStudentDto.address,
              enrollmentDate: createStudentDto.enrollmentDate
                ? new Date(createStudentDto.enrollmentDate)
                : undefined,
              academicStatus: createStudentDto.academicStatus,
              profileImage: createStudentDto.profileImage,
            },
          ],
          { session },
        );

        student = createdStudent;
      });

      if (!student) {
        throw new BadRequestException('Student registration was not completed');
      }

      return student;
    } catch (error: unknown) {
      this.logger.error('Student registration failed', error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A user or student with the supplied unique details already exists',
        );
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findAll(): Promise<StudentDocument[]> {
    return this.studentModel.find().exec();
  }

  async findOne(id: string): Promise<StudentDocument> {
    this.validateObjectId(id);

    const student = await this.studentModel.findById(id).exec();

    if (!student) {
      throw new NotFoundException(`Student with id ${id} was not found`);
    }

    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDocument> {
    this.validateObjectId(id);

    const existingStudent = await this.findOne(id);
    const session = await this.connection.startSession();

    try {
      let updatedStudent: StudentDocument | null = null;

      await session.withTransaction(async () => {
        if (updateStudentDto.user) {
          await this.userModel
            .findByIdAndUpdate(
              existingStudent.userId,
              {
                fullName: updateStudentDto.user.fullName,
                email: updateStudentDto.user.email,
                phoneNumber: updateStudentDto.user.phoneNumber,
                ...(updateStudentDto.user.password
                  ? {
                      passwordHash: this.hashPassword(
                        updateStudentDto.user.password,
                      ),
                    }
                  : {}),
              },
              { new: true, runValidators: true, session },
            )
            .exec();
        }

        const department = await this.resolveDepartmentForUpdate(
          updateStudentDto,
          session,
        );
        const course = await this.resolveCourseForUpdate(
          updateStudentDto,
          department?._id,
          session,
        );
        const semester = await this.resolveSemesterForUpdate(
          updateStudentDto,
          session,
        );

        updatedStudent = await this.studentModel
          .findByIdAndUpdate(
            id,
            {
              admissionNumber: updateStudentDto.admissionNumber,
              nationalId: updateStudentDto.nationalId,
              gender: updateStudentDto.gender,
              dateOfBirth: updateStudentDto.dateOfBirth
                ? new Date(updateStudentDto.dateOfBirth)
                : undefined,
              courseId: course?._id ?? updateStudentDto.courseId,
              departmentId: department?._id ?? updateStudentDto.departmentId,
              semesterId: semester?._id ?? updateStudentDto.semesterId,
              currentYear: updateStudentDto.currentYear,
              guardianContacts: updateStudentDto.guardianContacts,
              address: updateStudentDto.address,
              enrollmentDate: updateStudentDto.enrollmentDate
                ? new Date(updateStudentDto.enrollmentDate)
                : undefined,
              academicStatus: updateStudentDto.academicStatus,
              profileImage: updateStudentDto.profileImage,
            },
            { new: true, runValidators: true, session },
          )
          .exec();
      });

      if (!updatedStudent) {
        throw new NotFoundException(`Student with id ${id} was not found`);
      }

      return updatedStudent;
    } catch (error: unknown) {
      this.logger.error(`Student update failed for ${id}`, error);

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A user or student with the supplied unique details already exists',
        );
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string): Promise<StudentDocument> {
    this.validateObjectId(id);

    const session = await this.connection.startSession();
    let student: StudentDocument | null = null;

    try {
      await session.withTransaction(async () => {
        student = await this.studentModel
          .findByIdAndDelete(id)
          .session(session)
          .exec();
        if (!student) {
          throw new NotFoundException(`Student with id ${id} was not found`);
        }
        await this.userModel.findByIdAndDelete(student.userId).exec();

        await this.userModel
          .findByIdAndDelete(student.userId)
          .session(session)
          .exec();
      });

      return student!;
    } finally {
      await session.endSession();
    }
  }

  private async createStudentUser(
    createStudentDto: CreateStudentDto,
    session: ClientSession,
  ): Promise<UserDocument> {
    const [user] = await this.userModel.create(
      [
        {
          fullName: createStudentDto.user.fullName,
          email: createStudentDto.user.email,
          phoneNumber: createStudentDto.user.phoneNumber,
          passwordHash: this.hashPassword(createStudentDto.user.password),
          role: UserRole.STUDENT,
          isActive: true,
          mfaEnabled: false,
        },
      ],
      { session },
    );

    return user;
  }

  private async resolveDepartment(
    createStudentDto: CreateStudentDto,
    session: ClientSession,
  ): Promise<DepartmentDocument> {
    if (createStudentDto.departmentId) {
      return this.findDepartmentById(createStudentDto.departmentId, session);
    }

    if (!createStudentDto.department) {
      throw new BadRequestException(
        'A departmentId or department payload is required',
      );
    }

    return this.departmentModel
      .findOneAndUpdate(
        { code: createStudentDto.department.code.toUpperCase() },
        {
          $setOnInsert: {
            ...createStudentDto.department,
            code: createStudentDto.department.code.toUpperCase(),
          },
        },
        { new: true, upsert: true, runValidators: true, session },
      )
      .orFail(() => new BadRequestException('Department could not be resolved'))
      .exec();
  }

  private async resolveCourse(
    createStudentDto: CreateStudentDto,
    departmentId: Types.ObjectId,
    session: ClientSession,
  ): Promise<CourseDocument> {
    if (createStudentDto.courseId) {
      return this.findCourseById(createStudentDto.courseId, session);
    }

    if (!createStudentDto.course) {
      throw new BadRequestException('A courseId or course payload is required');
    }

    return this.courseModel
      .findOneAndUpdate(
        { courseCode: createStudentDto.course.courseCode.toUpperCase() },
        {
          $setOnInsert: {
            ...createStudentDto.course,
            departmentId,
          },
        },
        { new: true, upsert: true, runValidators: true, session },
      )
      .orFail(() => new BadRequestException('Course could not be resolved'))
      .exec();
  }

  private async resolveSemester(
    createStudentDto: CreateStudentDto,
    session: ClientSession,
  ): Promise<SemesterDocument | null> {
    if (createStudentDto.semesterId) {
      return this.findSemesterById(createStudentDto.semesterId, session);
    }

    if (!createStudentDto.semester) {
      return null;
    }

    return this.semesterModel
      .findOneAndUpdate(
        {
          name: createStudentDto.semester.name,
          academicYear: createStudentDto.semester.academicYear,
        },
        {
          $setOnInsert: {
            ...createStudentDto.semester,
            startDate: new Date(createStudentDto.semester.startDate),
            endDate: new Date(createStudentDto.semester.endDate),
          },
        },
        { new: true, upsert: true, runValidators: true, session },
      )
      .orFail(() => new BadRequestException('Semester could not be resolved'))
      .exec();
  }

  private async resolveDepartmentForUpdate(
    updateStudentDto: UpdateStudentDto,
    session: ClientSession,
  ): Promise<DepartmentDocument | null> {
    if (updateStudentDto.departmentId) {
      return this.findDepartmentById(updateStudentDto.departmentId, session);
    }

    if (!updateStudentDto.department) {
      return null;
    }

    return this.departmentModel
      .findOneAndUpdate(
        { code: updateStudentDto.department.code.toUpperCase() },
        { $setOnInsert: updateStudentDto.department },
        { new: true, upsert: true, runValidators: true, session },
      )
      .orFail(() => new BadRequestException('Department could not be resolved'))
      .exec();
  }

  private async resolveCourseForUpdate(
    updateStudentDto: UpdateStudentDto,
    departmentId: Types.ObjectId | undefined,
    session: ClientSession,
  ): Promise<CourseDocument | null> {
    if (updateStudentDto.courseId) {
      return this.findCourseById(updateStudentDto.courseId, session);
    }

    if (!updateStudentDto.course) {
      return null;
    }

    if (!departmentId && !updateStudentDto.departmentId) {
      throw new BadRequestException(
        'A departmentId or department payload is required when creating a course',
      );
    }

    const resolvedDepartmentId =
      departmentId ??
      (await this.findDepartmentById(updateStudentDto.departmentId!, session))
        ._id;

    return this.courseModel
      .findOneAndUpdate(
        { courseCode: updateStudentDto.course.courseCode.toUpperCase() },
        {
          $setOnInsert: {
            ...updateStudentDto.course,
            departmentId: resolvedDepartmentId,
          },
        },
        { new: true, upsert: true, runValidators: true, session },
      )
      .orFail(() => new BadRequestException('Course could not be resolved'))
      .exec();
  }

  private async resolveSemesterForUpdate(
    updateStudentDto: UpdateStudentDto,
    session: ClientSession,
  ): Promise<SemesterDocument | null> {
    if (updateStudentDto.semesterId) {
      return this.findSemesterById(updateStudentDto.semesterId, session);
    }

    if (!updateStudentDto.semester) {
      return null;
    }

    return this.semesterModel
      .findOneAndUpdate(
        {
          name: updateStudentDto.semester.name,
          academicYear: updateStudentDto.semester.academicYear,
        },
        {
          $setOnInsert: {
            ...updateStudentDto.semester,
            startDate: new Date(updateStudentDto.semester.startDate),
            endDate: new Date(updateStudentDto.semester.endDate),
          },
        },
        { new: true, upsert: true, runValidators: true, session },
      )
      .orFail(() => new BadRequestException('Semester could not be resolved'))
      .exec();
  }

  private async findDepartmentById(
    id: string,
    session: ClientSession,
  ): Promise<DepartmentDocument> {
    this.validateObjectId(id);

    return this.departmentModel
      .findById(id)
      .session(session)
      .orFail(
        () => new NotFoundException(`Department with id ${id} was not found`),
      )
      .exec();
  }

  private async findCourseById(
    id: string,
    session: ClientSession,
  ): Promise<CourseDocument> {
    this.validateObjectId(id);

    return this.courseModel
      .findById(id)
      .session(session)
      .orFail(() => new NotFoundException(`Course with id ${id} was not found`))
      .exec();
  }

  private async findSemesterById(
    id: string,
    session: ClientSession,
  ): Promise<SemesterDocument> {
    this.validateObjectId(id);

    return this.semesterModel
      .findById(id)
      .session(session)
      .orFail(
        () => new NotFoundException(`Semester with id ${id} was not found`),
      )
      .exec();
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
