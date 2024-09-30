import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Jobs } from 'src/company/entity/jobs.entity';

@Entity()
export class SavedApplications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.saved, {
    nullable: true,
  })
  student: Student;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @ManyToOne(() => Jobs, (job) => job.savedApplications, {
    nullable: false,
    onDelete: 'CASCADE', // Optional: Define behavior on deletion
  })
  @JoinColumn({ name: 'jobId' })
  job: Jobs;
}
