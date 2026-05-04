import { Test, TestingModule } from '@nestjs/testing';
import { LecturerController } from './lecturer.controller';
import { LecturerService } from './lecturer.service';

describe('LecturerController', () => {
  let controller: LecturerController;
  const lecturerServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturerController],
      providers: [{ provide: LecturerService, useValue: lecturerServiceMock }],
    }).compile();

    controller = module.get<LecturerController>(LecturerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
