import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../course/entities/course.entity';
import {
  Department,
  DepartmentSchema,
} from '../department/entities/department.entity';
import { Semester, SemesterSchema } from '../semester/entities/semester.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Student, StudentSchema } from './entities/student.entity';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Semester.name, schema: SemesterSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
