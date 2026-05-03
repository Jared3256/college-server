import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Course } from '../course/entities/course.entity';
import { Department } from '../department/entities/department.entity';
import { Semester } from '../semester/entities/semester.entity';
import { User } from '../user/entities/user.entity';
import { Student } from './entities/student.entity';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  const modelMock = {};
  const connectionMock = {
    startSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: getModelToken(Student.name), useValue: modelMock },
        { provide: getModelToken(User.name), useValue: modelMock },
        { provide: getModelToken(Department.name), useValue: modelMock },
        { provide: getModelToken(Course.name), useValue: modelMock },
        { provide: getModelToken(Semester.name), useValue: modelMock },
        { provide: getConnectionToken(), useValue: connectionMock },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
