import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseUnit } from '../course-unit/entities/course-unit.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Grade } from '../grade/entities/grade.entity';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { Semester } from '../semester/entities/semester.entity';
import { Assessment } from './entities/assessment.entity';
import { AssessmentService } from './assessment.service';

describe('AssessmentService', () => {
  let service: AssessmentService;
  const modelMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentService,
        { provide: getModelToken(Assessment.name), useValue: modelMock },
        { provide: getModelToken(CourseUnit.name), useValue: modelMock },
        { provide: getModelToken(Course.name), useValue: modelMock },
        { provide: getModelToken(Semester.name), useValue: modelMock },
        { provide: getModelToken(Lecturer.name), useValue: modelMock },
        { provide: getModelToken(Grade.name), useValue: modelMock },
        { provide: getModelToken(Enrollment.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<AssessmentService>(AssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
