// hooks/quick-share/useQuickShareFeed.ts

import useSWR from "swr";
import { QuickShareDto } from "@/lib/dto/quick-share.dto";

// 1️⃣ Define the response shape
interface QuickShareFeedResponse {
	items: QuickShareDto[];
	cursor: string | null;
}

const fetcher = (url: string) =>
	fetch(url).then((res) => {
		if (!res.ok) throw new Error("Network response was not ok");
		return res.json() as Promise<QuickShareFeedResponse>;
	});

export function useQuickShareFeed() {
	const { data, error, isLoading } = useSWR<QuickShareFeedResponse>("/api/quick-share", fetcher);

	// 2️⃣ Safely extract items and cursor
	const quickshares = data?.items ?? [];
	const cursor = data?.cursor ?? null;

	return {
		quickshares,
		cursor,
		isLoading,
		isError: !!error,
	};
}
