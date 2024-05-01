import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Student } from 'src/students/entity/student.entity';
import { Jobs } from './jobs.entity';

@Entity()
export class ShortlistedApplicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.shortlistedApplicants, {
    nullable: true,
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @ManyToOne(() => Jobs, (jobs) => jobs.shortListedApplicant)
  @JoinColumn({ name: 'companyId' })
  jobs: Jobs;
}
