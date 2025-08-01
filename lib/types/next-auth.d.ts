import { User as DomainUser } from "./user";

declare module "next-auth" {
	interface Session {
		user: DomainUser;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		user?: DomainUser;
	}
}
