import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [
    AuthModule,
  ]
})
export class StudentsModule {}
