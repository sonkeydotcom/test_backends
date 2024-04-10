import { UserRole } from 'src/auth/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Jobs } from './jobs.entity';
import { Student } from 'src/students/entity/student.entity';
import { AcceptedApplicants } from './applicant/accepted-applicant.entity';
import { ShortlistedApplicant } from './applicant/shortlisted-applicant.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @Column()
  companyId: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'date' })
  year_founded: Date;

  @Index()
  @Column()
  rc_number: string;

  @Column()
  address: string;

  @CreateDateColumn()
  createdDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMPANY })
  role: UserRole;

  @OneToMany(() => Jobs, (jobs) => jobs.company)
  jobs: Jobs[];

  @OneToMany(() => ShortlistedApplicant, (sap) => sap.company)
  shortListedApplicant: ShortlistedApplicant[];

  @ManyToOne(() => Student, (stu) => stu.saved)
  savedStudent: Student[];

  @OneToMany(() => AcceptedApplicants, (ap) => ap.company)
  acceptedApplicant: AcceptedApplicants[];

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  totalApplicants: number;
}
