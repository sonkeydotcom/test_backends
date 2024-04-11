import { UserRole } from "../entities/users.entity";

export type JWTBody = {
  email: string;
  userId: string;
  role: UserRole
};
