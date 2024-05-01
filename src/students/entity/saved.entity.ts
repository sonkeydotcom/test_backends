import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Jobs } from 'src/company/entity/jobs.entity';

@Entity()
export class SavedApplications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.savedApplication, {
    nullable: true,
  })
  student: Student;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @OneToOne(() => Jobs, (jobs) => jobs.savedApplications)
  jobs: Jobs;
}
