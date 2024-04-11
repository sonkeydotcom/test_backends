import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Student } from 'src/students/entity/student.entity';

@Entity()
export class AcceptedApplicants {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Company, (company) => company.acceptedApplicant)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => Student, (student) => student.acceptedApplicants, {
    nullable: true,
  })
  @JoinColumn({ name: 'studentId' })
  students: Student[];

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;
}
