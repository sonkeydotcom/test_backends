import { UserRole } from 'src/auth/entities/users.entity';
import { AcceptedApplicants } from 'src/company/entity/accepted-applicant.entity';
import { ShortlistedApplicant } from 'src/company/entity/shortlisted-applicant.entity';
import { Company } from 'src/company/entity/company.entity';
import { Jobs } from 'src/company/entity/jobs.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @OneToMany(() => Jobs, (jobs) => jobs.acceptedStudent)
  jobs: Jobs;

  @Column()
  school: string;

  @OneToMany(() => Jobs, (ap) => ap.appliedStudents)
  appliedStudent: Jobs[];

  @OneToMany(() => Company, (saved) => saved.savedStudent)
  saved: Company;

  @Column()
  department: string;

  @Column()
  courseOfStudy: string;

  @Column()
  level: string;

  @Column({ default: UserRole.STUDENT })
  role: UserRole;

  @Column()
  CGPA: string;

  @ManyToOne(() => ShortlistedApplicant, (sap) => sap.student)
  shortlistedApplicants: ShortlistedApplicant;

  @ManyToOne(() => AcceptedApplicants, (acp) => acp.students)
  acceptedApplicants: AcceptedApplicants;

  @Column({ default: false })
  searching: boolean;
}
