import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GradeStatus } from './entities/grade.entity';
import { GradeController } from './grade.controller';
import { GradeService } from './grade.service';

describe('GradeController', () => {
  let controller: GradeController;
  const gradeServiceMock = {
    create: jest.fn(),
    createBulk: jest.fn(),
    submit: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
    findByStudent: jest.fn(),
    findByCourseUnit: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradeController],
      providers: [{ provide: GradeService, useValue: gradeServiceMock }],
    }).compile();

    controller = module.get<GradeController>(GradeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates grade creation', async () => {
    const dto = {
      studentId: '665aa92db98f000000000001',
      courseUnitId: '665aa92db98f000000000002',
      examId: '665aa92db98f000000000003',
      marksScored: 78,
      enteredBy: '665aa92db98f000000000004',
    };
    const response = {
      success: true,
      message: 'Grade created successfully',
      data: { gradeId: '665aa92db98f000000000005', status: GradeStatus.DRAFT },
    };
    gradeServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(dto)).resolves.toBe(response);
    expect(gradeServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('delegates forbidden grade deletion', () => {
    const error = new ConflictException(
      'Grades cannot be deleted once entered',
    );
    gradeServiceMock.remove.mockImplementation(() => {
      throw error;
    });

    expect(() => controller.remove('665aa92db98f000000000005')).toThrow(error);
    expect(gradeServiceMock.remove).toHaveBeenCalledWith(
      '665aa92db98f000000000005',
    );
  });
});
