export interface CreateQuickShareDto {
	title: string;
	description: string;
	imageKey?: string;
}

export interface QuickShareDto {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	createdAt: string;
	status: string;
}
