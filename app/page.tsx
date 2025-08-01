import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { QuickShareFeed } from "@/components/custom/quick-share/QuickShareFeed";
import { CreateQuickShareModal } from "@/components/custom/quick-share/CreateQuickShareModal";

export default async function HomePage() {
	const session = await getSession();
	if (!session) redirect("/login");

	return (
		<main className="max-w-3xl mx-auto py-12 px-4 relative">
			<CreateQuickShareModal />
			<QuickShareFeed />
		</main>
	);
}
