import { QuickShareStatus } from "@/lib/types/enums/quick-share-status.enum";

export interface QuickShare {
	Id: string;
	creatorId: string;
	title: string;
	description: string;
	imageKey?: string;
	status: QuickShareStatus;
	createdAt: string;
}
