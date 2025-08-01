import { UserRole } from "@/lib/types/enums/user-role.enum";

export interface CreateUserDto {
	name: string;
	email: string;
	password: string;
	role?: UserRole;
}

export interface LoginUserDto {
	email: string;
	password: string;
}
