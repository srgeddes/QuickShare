"use client";

import { useQuickShareFeed } from "@/hooks/quick-share/useQuickShareFeed";
import { QuickShareCard } from "./QuickShareCard";
import { Skeleton } from "@/components/ui/skeleton";

export function QuickShareFeed() {
	const { quickshares, isLoading, isError } = useQuickShareFeed();

	if (isLoading) {
		return (
			<div className="space-y-6">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="w-full max-w-md h-[300px] mx-auto rounded-md" />
				))}
			</div>
		);
	}

	if (isError) {
		return <p className="text-center text-red-500">Failed to load quickshares. Try again later.</p>;
	}

	if (!Array.isArray(quickshares) || quickshares.length === 0) {
		return <p className="text-center text-muted-foreground mt-10">No posts yet. Be the first to share something!</p>;
	}

	return (
		<div className="space-y-6 animate-fade-in">
			{quickshares.map((qs) => (
				<QuickShareCard key={qs.id} quickshare={qs} />
			))}
		</div>
	);
}
