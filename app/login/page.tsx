"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center space-y-4">
				<h1 className="text-2xl font-bold">Welcome to QuickShare</h1>
				<Button onClick={() => signIn("google", { callbackUrl: "/" })}>Sign in with Google</Button>
			</div>
		</div>
	);
}
