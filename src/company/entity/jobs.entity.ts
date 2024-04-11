import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company as Company } from './company.entity';
import { Student } from 'src/students/entity/student.entity';

@Entity()
export class Jobs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  level: string;

  @Column({ default: 0 })
  totalApplicants: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @Column({ default: 0 })
  shortListedApplicant: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @Column({ default: 0 })
  acceptedApplicant: number;

  @ManyToOne(() => Student, (st) => st.appliedStudent)
  appliedStudents: Student[];

  @ManyToOne(() => Company, (company) => company.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ default: 0 })
  duration: number;

  @ManyToOne(() => Student, (student) => student.jobs)
  @JoinColumn({ name: 'studentId' })
  acceptedStudent: Student[];

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
}
