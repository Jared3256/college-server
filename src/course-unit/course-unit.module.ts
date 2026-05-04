import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Assessment, AssessmentSchema } from '../assessment/entities/assessment.entity';
import { Attendance, AttendanceSchema } from '../attendance/entities/attendance.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { Enrollment, EnrollmentSchema } from '../enrollment/entities/enrollment.entity';
import { Lecturer, LecturerSchema } from '../lecturer/entities/lecturer.entity';
import { Semester, SemesterSchema } from '../semester/entities/semester.entity';
import { CourseUnitController } from './course-unit.controller';
import { CourseUnitService } from './course-unit.service';
import { CourseUnit, CourseUnitSchema } from './entities/course-unit.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseUnit.name, schema: CourseUnitSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: Lecturer.name, schema: LecturerSchema },
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [CourseUnitController],
  providers: [CourseUnitService],
})
export class CourseUnitModule {}
