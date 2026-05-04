import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Department,
  DepartmentSchema,
} from '../department/entities/department.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Lecturer, LecturerSchema } from './entities/lecturer.entity';
import { LecturerController } from './lecturer.controller';
import { LecturerService } from './lecturer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lecturer.name, schema: LecturerSchema },
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [LecturerController],
  providers: [LecturerService],
})
export class LecturerModule {}
