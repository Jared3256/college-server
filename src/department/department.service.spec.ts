import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { DepartmentService } from './department.service';
import { Department } from './entities/department.entity';

describe('DepartmentService', () => {
  let service: DepartmentService;
  const modelMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        { provide: getModelToken(Department.name), useValue: modelMock },
        { provide: getModelToken(Lecturer.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
