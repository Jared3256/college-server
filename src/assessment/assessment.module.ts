import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Assessment, AssessmentSchema } from './entities/assessment.entity';
import {
  CourseUnit,
  CourseUnitSchema,
} from '../course-unit/entities/course-unit.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { Semester, SemesterSchema } from '../semester/entities/semester.entity';
import { Lecturer, LecturerSchema } from '../lecturer/entities/lecturer.entity';
import { Grade, GradeSchema } from '../grade/entities/grade.entity';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollment/entities/enrollment.entity';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: CourseUnit.name, schema: CourseUnitSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: Lecturer.name, schema: LecturerSchema },
      { name: Grade.name, schema: GradeSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}
