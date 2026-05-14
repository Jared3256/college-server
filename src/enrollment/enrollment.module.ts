import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourseUnit,
  CourseUnitSchema,
} from '../course-unit/entities/course-unit.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { Semester, SemesterSchema } from '../semester/entities/semester.entity';
import { Student, StudentSchema } from '../student/entities/student.entity';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { Enrollment, EnrollmentSchema } from './entities/enrollment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseUnit.name, schema: CourseUnitSchema },
      { name: Semester.name, schema: SemesterSchema },
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
})
export class EnrollmentModule {}
