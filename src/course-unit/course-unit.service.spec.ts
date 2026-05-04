import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Assessment } from '../assessment/entities/assessment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Lecturer } from '../lecturer/entities/lecturer.entity';
import { Semester } from '../semester/entities/semester.entity';
import { CourseUnitService } from './course-unit.service';
import { CourseUnit } from './entities/course-unit.entity';

describe('CourseUnitService', () => {
  let service: CourseUnitService;
  const modelMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseUnitService,
        { provide: getModelToken(CourseUnit.name), useValue: modelMock },
        { provide: getModelToken(Course.name), useValue: modelMock },
        { provide: getModelToken(Semester.name), useValue: modelMock },
        { provide: getModelToken(Lecturer.name), useValue: modelMock },
        { provide: getModelToken(Assessment.name), useValue: modelMock },
        { provide: getModelToken(Attendance.name), useValue: modelMock },
        { provide: getModelToken(Enrollment.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<CourseUnitService>(CourseUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
