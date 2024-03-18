import { UserRole } from 'src/auth/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
  it_duration: number;

  @Column()
  student_capacity: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMPANY })
  role: UserRole;
}
