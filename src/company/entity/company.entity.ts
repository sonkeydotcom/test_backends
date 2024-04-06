import { UserRole } from 'src/auth/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Jobs } from './jobs.entity';

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

  // @Column()
  // student_capacity: number; this is not needed IMO
  //NOTE: I moved the it duration column to the jobs entity

  @CreateDateColumn()
  createdDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMPANY })
  role: UserRole;

  @OneToMany(() => Jobs, (jobs) => jobs.company)
  jobs: Jobs[];

  @Column()
  shortListedApplicant: number;

  @Column()
  acceptedApplicant: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  totalApplicants: number;
}
