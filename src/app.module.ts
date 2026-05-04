import { Module } from '@nestjs/common';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { StudentModule } from './student/student.module';
import { TutorModule } from './tutor/tutor.module';
import { SemesterModule } from './semester/semester.module';
import { UnitsModule } from './units/units.module';
import { ExamsModule } from './exams/exams.module';
import { DepartmentModule } from './department/department.module';
import { CourseModule } from './course/course.module';
import { CourseUnitModule } from './course-unit/course-unit.module';
import { LecturerModule } from './lecturer/lecturer.module';
import { AssessmentModule } from './assessment/assessment.module';
import configuration from './config/config.service';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env'],
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        if (!uri) {
          throw new Error(
            'MONGODB_URI environment variable is not set. Cannot start without a database connection.',
          );
        }
        return { uri };
      },
    }),
    AuthModule,
    StudentModule,
    DepartmentModule,
    CourseModule,
    CourseUnitModule,
    LecturerModule,
    AssessmentModule,
    TutorModule,
    SemesterModule,
    UnitsModule,
    ExamsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    AppService,
  ],
})
export class AppModule {}
