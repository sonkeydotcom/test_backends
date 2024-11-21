import { UserRole } from 'src/auth/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

  @Column()
  year_founded: string;

  @Column({ nullable: true })
  student_capacity: number;

  @Column({ nullable: true })
  phone: string;

  @Index()
  @Column()
  rc_number: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ nullable: true })
  backgroundImageUrl: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMPANY })
  role: UserRole;

  @OneToMany(() => Jobs, (jobs) => jobs.company)
  jobs: Jobs[];

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ default: 0, nullable: true })
  totalApplicants: number;

  @Column({ default: 0, nullable: true })
  acceptedApplicants: number;

  @Column({ default: 0, nullable: true })
  shortListedApplicants: number;
}
