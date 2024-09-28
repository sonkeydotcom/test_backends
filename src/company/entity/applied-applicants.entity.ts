import { Student } from 'src/students/entity/student.entity';
import {
  Column,
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

  // @OneToMany(() => Jobs, (jobs) => jobs.appliedStudent)
  // job: Jobs;

  @ManyToOne(() => Jobs, (job) => job.appliedStudent)
  job: Jobs; // Change this to ManyToOne to properly reflect the relationship

  @Column({
    type: 'boolean',
    default: false,
  })
  accepted: boolean;
}
