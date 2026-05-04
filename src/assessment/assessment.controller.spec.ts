import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { AssessmentType } from './entities/assessment.entity';

describe('AssessmentController', () => {
  let controller: AssessmentController;
  const assessmentServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentController],
      providers: [
        { provide: AssessmentService, useValue: assessmentServiceMock },
      ],
    }).compile();

    controller = module.get<AssessmentController>(AssessmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create requests to the service', async () => {
    const dto = {
      unitCode: 'ICT101',
      title: 'CAT 1',
      type: AssessmentType.CAT,
      totalMarks: 30,
      createdBy: '64f1f77bcf1d2f0012345678',
    };
    const createdAssessment = { _id: 'assessment-id', ...dto };

    assessmentServiceMock.create.mockResolvedValue(createdAssessment);

    await expect(controller.create(dto)).resolves.toBe(createdAssessment);
    expect(assessmentServiceMock.create).toHaveBeenCalledWith(dto);
  });
});
