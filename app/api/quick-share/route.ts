import { NextRequest, NextResponse } from "next/server";
import { quickShareService } from "@/lib/services/quick-share.service";
import { createQuickShareSchema } from "@/lib/validation/quick-share.schema";
import { getToken } from "next-auth/jwt";
import { env } from "@/lib/config";

export async function GET() {
	try {
		const { items, cursor } = await quickShareService.getPaginated();
		return NextResponse.json({ items, cursor });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to fetch quickshares";
		return NextResponse.json({ message }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	const token = await getToken({ req, secret: env.nextAuth.secret });

	const userId = token?.sub;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const parsed = createQuickShareSchema.parse(body);

	const quickshare = await quickShareService.createItem(parsed, userId as string);
	return NextResponse.json(quickshare);
}
