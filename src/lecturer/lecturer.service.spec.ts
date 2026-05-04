import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
import { Lecturer } from './entities/lecturer.entity';
import { LecturerService } from './lecturer.service';

describe('LecturerService', () => {
  let service: LecturerService;
  const modelMock = {};
  const connectionMock = {
    startSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturerService,
        { provide: getModelToken(Lecturer.name), useValue: modelMock },
        { provide: getModelToken(User.name), useValue: modelMock },
        { provide: getModelToken(Department.name), useValue: modelMock },
        { provide: getConnectionToken(), useValue: connectionMock },
      ],
    }).compile();

    service = module.get<LecturerService>(LecturerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
