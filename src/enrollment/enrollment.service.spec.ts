import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseUnit } from '../course-unit/entities/course-unit.entity';
import { Course } from '../course/entities/course.entity';
import { Semester } from '../semester/entities/semester.entity';
import { Student } from '../student/entities/student.entity';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  const modelMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: getModelToken(Enrollment.name), useValue: modelMock },
        { provide: getModelToken(Student.name), useValue: modelMock },
        { provide: getModelToken(Course.name), useValue: modelMock },
        { provide: getModelToken(CourseUnit.name), useValue: modelMock },
        { provide: getModelToken(Semester.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
