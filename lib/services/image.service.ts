// lib/services/imageService.ts

import { PutCommand, QueryCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { ddb, s3Client } from "@/lib/aws/client";
import { DynamoDBAttr } from "@/lib/constants/dynamodb";
import { env } from "@/lib/config";
import { Image } from "@/lib/types/image.type";
import { CreateImageDto } from "@/lib/dto/image.dto";
import { ServerResponse, ResponseStatus } from "@/lib/dto/server-response.dto";

/** Matches the exact attribute names of a Dynamo item for an Image */
interface ImageRecord {
	[DynamoDBAttr.PK]: string; // e.g. "IMAGE#<id>"
	[DynamoDBAttr.SK]: string; // "META"
	[DynamoDBAttr.USER_ID]: string; // ownerId
	[DynamoDBAttr.IMAGE_KEY]: string; // S3 key
	[DynamoDBAttr.IMAGE_NAME]: string; // filename
	[DynamoDBAttr.CREATED_AT]: string; // createdAt
}

/**
 * Generate a presigned PUT URL so the client can upload directly to S3.
 */
export async function getUploadUrl(key: string, expiresInSeconds = 60): Promise<ServerResponse<string>> {
	try {
		const cmd = new PutObjectCommand({
			Bucket: env.aws.imagesBucket,
			Key: key,
		});
		const url = await getSignedUrl(s3Client, cmd, { expiresIn: expiresInSeconds });
		return { status: ResponseStatus.Success, message: "Presigned URL generated", data: url };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		return { status: ResponseStatus.Failure, message: msg };
	}
}

/**
 * Save an Image record after S3 upload completes.
 */
export async function createImage(dto: CreateImageDto, ownerId: string): Promise<ServerResponse<Image>> {
	try {
		const id = randomUUID();
		const createdAt = new Date().toISOString();
		const item: Image = { id, ownerId, key: dto.key, filename: dto.filename, createdAt };

		await ddb.send(
			new PutCommand({
				TableName: env.aws.imagesTable,
				Item: {
					[DynamoDBAttr.PK]: `IMAGE#${item.id}`,
					[DynamoDBAttr.SK]: DynamoDBAttr.META,
					[DynamoDBAttr.USER_ID]: item.ownerId,
					[DynamoDBAttr.IMAGE_KEY]: item.key,
					[DynamoDBAttr.IMAGE_NAME]: item.filename,
					[DynamoDBAttr.CREATED_AT]: item.createdAt,
				},
			})
		);

		return { status: ResponseStatus.Success, message: "Image record created", data: item };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		return { status: ResponseStatus.Failure, message: msg };
	}
}

/**
 * List all images for a given user.
 */
export async function listImagesByUser(ownerId: string): Promise<ServerResponse<Image[]>> {
	try {
		const resp = await ddb.send(
			new QueryCommand({
				TableName: env.aws.imagesTable,
				IndexName: "UserIndex", // GSI on USER_ID
				KeyConditionExpression: "#uid = :uid",
				ExpressionAttributeNames: { "#uid": DynamoDBAttr.USER_ID },
				ExpressionAttributeValues: { ":uid": ownerId },
			})
		);

		// Now strongly typed
		const records = (resp.Items ?? []) as ImageRecord[];
		const images = records.map((it) => ({
			id: it[DynamoDBAttr.PK].split("#", 2)[1],
			ownerId: it[DynamoDBAttr.USER_ID],
			key: it[DynamoDBAttr.IMAGE_KEY],
			filename: it[DynamoDBAttr.IMAGE_NAME],
			createdAt: it[DynamoDBAttr.CREATED_AT],
		}));

		return { status: ResponseStatus.Success, message: "Images fetched", data: images };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		return { status: ResponseStatus.Failure, message: msg };
	}
}

/**
 * Fetch a single image record by its ID.
 */
export async function getImageById(id: string): Promise<ServerResponse<Image>> {
	try {
		const resp = await ddb.send(
			new GetCommand({
				TableName: env.aws.imagesTable,
				Key: {
					[DynamoDBAttr.PK]: `IMAGE#${id}`,
					[DynamoDBAttr.SK]: DynamoDBAttr.META,
				},
			})
		);

		if (!resp.Item) {
			return { status: ResponseStatus.Failure, message: "Image not found" };
		}

		const it = resp.Item as ImageRecord;
		const image: Image = {
			id,
			ownerId: it[DynamoDBAttr.USER_ID],
			key: it[DynamoDBAttr.IMAGE_KEY],
			filename: it[DynamoDBAttr.IMAGE_NAME],
			createdAt: it[DynamoDBAttr.CREATED_AT],
		};
		return { status: ResponseStatus.Success, message: "Image fetched", data: image };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		return { status: ResponseStatus.Failure, message: msg };
	}
}

/**
 * Delete an image (metadata + S3 object).
 */
export async function deleteImage(id: string): Promise<ServerResponse<null>> {
	try {
		// fetch metadata
		const record = await getImageById(id);
		if (record.status !== ResponseStatus.Success || !record.data) {
			return { status: ResponseStatus.Failure, message: "Image not found" };
		}
		const key = record.data.key;

		// delete S3 object
		await s3Client.send(
			new DeleteObjectCommand({
				Bucket: env.aws.imagesBucket,
				Key: key,
			})
		);

		// delete metadata
		await ddb.send(
			new DeleteCommand({
				TableName: env.aws.imagesTable,
				Key: {
					[DynamoDBAttr.PK]: `IMAGE#${id}`,
					[DynamoDBAttr.SK]: DynamoDBAttr.META,
				},
			})
		);

		return { status: ResponseStatus.Success, message: "Image deleted" };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		return { status: ResponseStatus.Failure, message: msg };
	}
}

const imageService = {
	getUploadUrl,
	createImage,
	listImagesByUser,
	getImageById,
	deleteImage,
};

export default imageService;
