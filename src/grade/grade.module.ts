import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditLog,
  AuditLogSchema,
} from '../audit-log/entities/audit-log.entity';
import {
  CourseUnit,
  CourseUnitSchema,
} from '../course-unit/entities/course-unit.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import {
  Department,
  DepartmentSchema,
} from '../department/entities/department.entity';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollment/entities/enrollment.entity';
import { Exam, ExamSchema } from '../exams/entities/exam.entity';
import { Lecturer, LecturerSchema } from '../lecturer/entities/lecturer.entity';
import {
  Notification,
  NotificationSchema,
} from '../notification/entities/notification.entity';
import {
  ParentStudentLink,
  ParentStudentLinkSchema,
} from '../parent-student-link/entities/parent-student-link.entity';
import { Parent, ParentSchema } from '../parent/entities/parent.entity';
import { Student, StudentSchema } from '../student/entities/student.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Grade, GradeSchema } from './entities/grade.entity';
import { GradeController } from './grade.controller';
import { GradeService } from './grade.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Grade.name, schema: GradeSchema },
      { name: Student.name, schema: StudentSchema },
      { name: CourseUnit.name, schema: CourseUnitSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Lecturer.name, schema: LecturerSchema },
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ParentStudentLink.name, schema: ParentStudentLinkSchema },
      { name: Parent.name, schema: ParentSchema },
    ]),
  ],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
