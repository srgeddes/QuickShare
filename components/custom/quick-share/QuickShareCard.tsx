"use client";

import { QuickShareDto } from "@/lib/dto/quick-share.dto";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function QuickShareCard({ quickshare }: { quickshare: QuickShareDto }) {
	return (
		<Card className="w-full max-w-md mx-auto shadow-md">
			<CardHeader>
				<h2 className="text-lg font-semibold">{quickshare.title}</h2>
				<p className="text-muted-foreground text-sm">{quickshare.createdAt}</p>
			</CardHeader>
			<CardContent>
				{quickshare.imageUrl && (
					<div className="mb-4">
						<Image src={quickshare.imageUrl} alt={quickshare.title} width={600} height={400} className="rounded-md object-cover" />
					</div>
				)}
				<p>{quickshare.description}</p>
			</CardContent>
		</Card>
	);
}
