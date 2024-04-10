import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../company.entity';
import { Student } from 'src/students/entity/student.entity';

@Entity()
export class ShortlistedApplicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Student, (student) => student.shortlistedApplicants, {
    nullable: true,
  })
  @JoinColumn({ name: 'studentId' })
  student: Student[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @ManyToOne(() => Company, (company) => company.shortListedApplicant)
  @JoinColumn({ name: 'companyId' })
  company: Company;
}
