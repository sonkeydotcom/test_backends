import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  STUDENT = 'student',
  COMPANY = 'company',
  ADMIN = 'admin',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Index()
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDat: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
