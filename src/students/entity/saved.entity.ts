import { ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "./student.entity";

export class SavedApplicants {
    @PrimaryGeneratedColumn('uuid')
    id: string

    // @ManyToOne(() => Student, (student) => student.sho)
}