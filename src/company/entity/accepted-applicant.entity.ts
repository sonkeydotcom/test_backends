import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from 'src/students/entity/student.entity';
import { Jobs } from './jobs.entity';

@Entity()
export class AcceptedApplicants {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @ManyToOne(() => Jobs, (jap) => jap.acceptedApplicant)
  jobs: Jobs;

  @ManyToOne(() => Student, (student) => student.acceptedApplicants, {
    nullable: true,
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // todo stduents

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;
}
