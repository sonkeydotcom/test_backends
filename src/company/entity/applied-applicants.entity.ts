import { Student } from 'src/students/entity/student.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Jobs } from './jobs.entity';

@Entity()
export class AppliedStudents {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Student, (student) => student.applied)
  student: Student;

  @OneToMany(() => Jobs, (jobs) => jobs.appliedStudent)
  job: Jobs;
}
