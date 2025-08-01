import { UserRole } from "./enums/user-role.enum";

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
}
