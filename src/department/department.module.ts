import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lecturer, LecturerSchema } from '../lecturer/entities/lecturer.entity';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department, DepartmentSchema } from './entities/department.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Lecturer.name, schema: LecturerSchema },
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
