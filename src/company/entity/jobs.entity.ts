import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company as Company } from './company.entity';

export class Jobs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  totalApplicants: number;

  @CreateDateColumn()
  createdDate: Date;

  @Column()
  shortListedApplicant: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  acceptedApplicant: number;

  @ManyToOne(() => Company, (company) => company.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  it_duration: number;
}
