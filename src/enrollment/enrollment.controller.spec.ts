import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  const enrollmentServiceMock = {
    registerCourse: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        { provide: EnrollmentService, useValue: enrollmentServiceMock },
      ],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates course registration requests to the service', async () => {
    const dto = {
      studentId: '64f1f77bcf1d2f0012345678',
      courseId: '64f1f77bcf1d2f0012345679',
    };
    const student = { _id: dto.studentId, courseId: dto.courseId };

    enrollmentServiceMock.registerCourse.mockResolvedValue(student);

    await expect(controller.registerCourse(dto)).resolves.toBe(student);
    expect(enrollmentServiceMock.registerCourse).toHaveBeenCalledWith(dto);
  });

  it('delegates unit enrollment requests to the service', async () => {
    const dto = {
      studentId: '64f1f77bcf1d2f0012345678',
      courseUnitId: '64f1f77bcf1d2f0012345679',
      semesterId: '64f1f77bcf1d2f0012345680',
    };
    const enrollment = { _id: 'enrollment-id', ...dto };

    enrollmentServiceMock.create.mockResolvedValue(enrollment);

    await expect(controller.create(dto)).resolves.toBe(enrollment);
    expect(enrollmentServiceMock.create).toHaveBeenCalledWith(dto);
  });
});
