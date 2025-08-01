import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/lib/config";
import { UserRole } from "@/lib/types/enums/user-role.enum";
import userService from "@/lib/services/user.service";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: env.nextAuth.googleClientId,
			clientSecret: env.nextAuth.googleClientSecret,
		}),
	],
	session: {
		strategy: "jwt",
	},
	secret: env.nextAuth.secret,
	callbacks: {
		async signIn({ user, account }) {
			const userId = account?.providerAccountId;
			if (!userId) return false;

			await userService.upsert({
				id: userId,
				name: user.name!,
				email: user.email!,
				role: UserRole.Viewer,
			});

			(user as any).id = userId; // 👈 force inject `id` for jwt()

			return true;
		},

		async jwt({ token, user }) {
			if (user && user.id) {
				token.user = {
					id: user.id,
					name: user.name!,
					email: user.email!,
					role: UserRole.Viewer,
					createdAt: new Date().toISOString(),
				};
			}
			return token;
		},

		async session({ session, token }) {
			if (token.user) {
				session.user = token.user;
			}
			return session;
		},
	},
};
