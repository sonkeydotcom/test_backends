import { UserRole } from 'src/auth/entities/users.entity';
import { AcceptedApplicants } from 'src/company/entity/accepted-applicant.entity';
import { ShortlistedApplicant } from 'src/company/entity/shortlisted-applicant.entity';
import { Company } from 'src/company/entity/company.entity';
import { Jobs } from 'src/company/entity/jobs.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentNotification } from 'src/notifications/entity/notification.entity';
import { AppliedStudents } from 'src/company/entity/applied-applicants.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate: Date;

  @Column()
  school: string;

  @Column()
  department: string;

  @Column()
  courseOfStudy: string;

  @Column()
  level: string;

  @Column({ default: UserRole.STUDENT })
  role: UserRole;

  @Column()
  CGPA: string;

  @OneToMany(() => ShortlistedApplicant, (sap) => sap.student)
  shortlistedApplicants: ShortlistedApplicant[];

  @OneToMany(() => AcceptedApplicants, (acp) => acp.students)
  acceptedApplicants: AcceptedApplicants[];

  @Column({ default: false })
  searching: boolean;

  @OneToMany(() => StudentNotification, (notification) => notification.student)
  notification: StudentNotification[];

  @OneToMany(() => AppliedStudents, (applied) => applied.student)
  applied: AppliedStudents[];
}
