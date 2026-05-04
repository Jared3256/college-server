import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Department } from '../department/entities/department.entity';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';

describe('CourseService', () => {
  let service: CourseService;
  const modelMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: getModelToken(Course.name), useValue: modelMock },
        { provide: getModelToken(Department.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
