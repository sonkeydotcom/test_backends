import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';

@Entity()
export class SavedApplications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.savedApplication, {
    nullable: true,
  })
  student: Student;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;
}
