import { v4 as uuidv4 } from "uuid";
import { ddb } from "@/lib/aws/client";
import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { CreateQuickShareDto, QuickShareDto } from "@/lib/dto/quick-share.dto";
import { QuickShareStatus } from "@/lib/types/enums/quick-share-status.enum";
import { QuickShare } from "@/lib/types/quick-share.type";
import { toQuickShareDto } from "@/lib/extensions/quick-share.extensions";
import { DynamoDBAttr } from "@/lib/constants/dynamodb";

const TABLE_NAME = process.env.QUICKSHARES_TABLE!;

export const quickShareService = {
	async createItem(dto: CreateQuickShareDto, creatorId: string): Promise<QuickShareDto> {
		const now = new Date().toISOString();
		const id = uuidv4();

		// Build the raw DynamoDB record with PK/SK
		const dbRecord = {
			[DynamoDBAttr.PK]: id,
			[DynamoDBAttr.SK]: DynamoDBAttr.META,
			creatorId,
			title: dto.title,
			description: dto.description,
			imageKey: dto.imageKey,
			status: QuickShareStatus.Active,
			createdAt: now,
		};

		// Write it to DynamoDB
		await ddb.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: dbRecord,
			})
		);

		// Map back to your domain model
		const domainItem: QuickShare = {
			Id: dbRecord[DynamoDBAttr.PK],
			creatorId: dbRecord.creatorId,
			title: dbRecord.title,
			description: dbRecord.description,
			imageKey: dbRecord.imageKey,
			status: dbRecord.status,
			createdAt: dbRecord.createdAt,
		};

		return toQuickShareDto(domainItem);
	},

	async getById(id: string): Promise<QuickShareDto | null> {
		const result = await ddb.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: {
					[DynamoDBAttr.PK]: id,
					[DynamoDBAttr.SK]: DynamoDBAttr.META,
				},
			})
		);

		if (!result.Item) return null;

		const rec = result.Item as Record<string, any>;
		const domainItem: QuickShare = {
			Id: rec[DynamoDBAttr.PK],
			creatorId: rec.creatorId,
			title: rec.title,
			description: rec.description,
			imageKey: rec.imageKey,
			status: rec.status,
			createdAt: rec.createdAt,
		};

		return toQuickShareDto(domainItem);
	},

	async getAll(): Promise<QuickShareDto[]> {
		const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));

		const items = ((result.Items as Record<string, any>[]) || []).map((rec) => ({
			Id: rec[DynamoDBAttr.PK],
			creatorId: rec.creatorId,
			title: rec.title,
			description: rec.description,
			imageKey: rec.imageKey,
			status: rec.status,
			createdAt: rec.createdAt,
		}));

		return items.map(toQuickShareDto);
	},

	async getPaginated(cursor?: string) {
		const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));

		const all = ((result.Items as Record<string, any>[]) || []).map((rec) => ({
			Id: rec[DynamoDBAttr.PK],
			creatorId: rec.creatorId,
			title: rec.title,
			description: rec.description,
			imageKey: rec.imageKey,
			status: rec.status,
			createdAt: rec.createdAt,
		}));

		// Sort by createdAt desc
		const sorted = all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

		// Simple page slicing
		const pageSize = 10;
		const start = cursor ? parseInt(cursor, 10) : 0;
		const end = start + pageSize;
		const page = sorted.slice(start, end);
		const nextCursor = end < sorted.length ? end.toString() : null;

		return {
			items: page.map(toQuickShareDto),
			cursor: nextCursor,
		};
	},
};
