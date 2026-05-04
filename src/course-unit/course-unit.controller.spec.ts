import { Test, TestingModule } from '@nestjs/testing';
import { CourseUnitController } from './course-unit.controller';
import { CourseUnitService } from './course-unit.service';

describe('CourseUnitController', () => {
  let controller: CourseUnitController;
  const courseUnitServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseUnitController],
      providers: [{ provide: CourseUnitService, useValue: courseUnitServiceMock }],
    }).compile();

    controller = module.get<CourseUnitController>(CourseUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
