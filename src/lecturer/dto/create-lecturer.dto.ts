import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLecturerUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateLecturerDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLecturerUserDto)
  user?: CreateLecturerUserDto;

  @IsMongoId()
  departmentId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsDateString()
  employmentDate?: string;
}

export class UpdateLecturerUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;
  // password intentionally excluded
}

/**
 * To be checked later incase a problem arises
 * 
 * +import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
+
+function IsUserOrUserIdProvided(validationOptions?: ValidationOptions) {
+  return (object: object, propertyName: string) => {
+    registerDecorator({
+      name: 'isUserOrUserIdProvided',
+      target: (object as any).constructor,
+      propertyName,
+      options: {
+        message: 'Either userId or user must be provided',
+        ...validationOptions,
+      },
+      validator: {
+        validate(_: unknown, args: ValidationArguments) {
+          const dto = args.object as CreateLecturerDto;
+          return !!dto.userId || !!dto.user;
+        },
+      },
+    });
+  };
+}
+
 export class CreateLecturerDto {
+  `@IsUserOrUserIdProvided`()
   `@IsOptional`()
   `@IsMongoId`()
   userId?: string;
 */
