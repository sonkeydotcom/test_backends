import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company as Company } from './company.entity';
import { Student } from 'src/students/entity/student.entity';
import { AppliedStudents } from './applied-applicants.entity';
import { AcceptedApplicants } from './accepted-applicant.entity';
import { ShortlistedApplicant } from './shortlisted-applicant.entity';

@Entity()
export class Jobs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  level: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @OneToMany(() => ShortlistedApplicant, (student) => student.jobs)
  shortListedApplicant: ShortlistedApplicant[];

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @OneToMany(() => AcceptedApplicants, (ap) => ap.jobs, { nullable: true })
  acceptedApplicant: AcceptedApplicants[];

  @ManyToOne(() => Company, (company) => company.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  duration: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  description: string;

  @Column()
  industry: string;

  @OneToMany(() => AppliedStudents, (appliedStudent) => appliedStudent.job)
  appliedStudent: AppliedStudents[];

  @Column({ default: 0 })
  totalApplicants: number;

  @Column({ default: 0 })
  acceptedApplicants: number;

  @Column({ default: 0 })
  shortListedApplicants: number;
}
