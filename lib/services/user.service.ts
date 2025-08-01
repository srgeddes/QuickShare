// lib/services/userService.ts

import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { ddb } from "@/lib/aws/client";
import { DynamoDBAttr } from "@/lib/constants/dynamodb";
import { env } from "@/lib/config";
import { User } from "@/lib/types/user.type";
import { UserRole } from "@/lib/types/enums/user-role.enum";
import { CreateUserDto } from "@/lib/dto/user.dto";
import { ServerResponse, ResponseStatus } from "@/lib/dto/server-response.dto";

export interface UserWithPassword extends User {
	hashedPassword: string;
}

/** Matches the exact attribute names of a Dynamo item for a User */
interface UserRecord {
	[DynamoDBAttr.PK]: string; // e.g. "USER#<id>"
	[DynamoDBAttr.SK]: string; // "META"
	[DynamoDBAttr.USER_NAME]: string;
	[DynamoDBAttr.USER_EMAIL]: string;
	[DynamoDBAttr.USER_ROLE]: UserRole;
	[DynamoDBAttr.CREATED_AT]: string;
	[DynamoDBAttr.USER_PASSWORD]: string;
}

/**
 * Sign up a new user via email/password.
 */
async function create(dto: CreateUserDto): Promise<ServerResponse<User>> {
	try {
		const id = randomUUID();
		const createdAt = new Date().toISOString();
		const bcrypt = await import("bcryptjs");
		const hashed = await bcrypt.hash(dto.password, 10);

		const item: UserWithPassword = {
			id,
			name: dto.name,
			email: dto.email,
			role: dto.role ?? UserRole.Editor,
			createdAt,
			hashedPassword: hashed,
		};

		await ddb.send(
			new PutCommand({
				TableName: env.aws.usersTable,
				Item: {
					[DynamoDBAttr.PK]: `USER#${item.id}`,
					[DynamoDBAttr.SK]: DynamoDBAttr.META,
					[DynamoDBAttr.USER_NAME]: item.name,
					[DynamoDBAttr.USER_EMAIL]: item.email,
					[DynamoDBAttr.USER_ROLE]: item.role,
					[DynamoDBAttr.CREATED_AT]: item.createdAt,
					[DynamoDBAttr.USER_PASSWORD]: item.hashedPassword,
				},
			})
		);

		// construct public user without hashed password
		const publicUser: User = {
			id: item.id,
			name: item.name,
			email: item.email,
			role: item.role,
			createdAt: item.createdAt,
		};
		return {
			status: ResponseStatus.Success,
			message: "User created successfully",
			data: publicUser,
		};
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		return {
			status: ResponseStatus.Failure,
			message,
		};
	}
}

/**
 * Lookup a user by email.
 */
async function getByEmail(email: string): Promise<ServerResponse<UserWithPassword>> {
	try {
		const resp = await ddb.send(
			new QueryCommand({
				TableName: env.aws.usersTable,
				IndexName: "EmailIndex",
				KeyConditionExpression: "#email = :email",
				ExpressionAttributeNames: {
					"#email": DynamoDBAttr.USER_EMAIL,
				},
				ExpressionAttributeValues: {
					":email": email,
				},
				Limit: 1,
			})
		);

		if (!resp.Items || resp.Items.length === 0) {
			return {
				status: ResponseStatus.Failure,
				message: "User not found",
			};
		}

		const it = resp.Items[0] as UserRecord;
		const user: UserWithPassword = {
			id: it[DynamoDBAttr.PK].split("#")[1],
			name: it[DynamoDBAttr.USER_NAME],
			email: it[DynamoDBAttr.USER_EMAIL],
			role: it[DynamoDBAttr.USER_ROLE],
			createdAt: it[DynamoDBAttr.CREATED_AT],
			hashedPassword: it[DynamoDBAttr.USER_PASSWORD],
		};

		return {
			status: ResponseStatus.Success,
			message: "User fetched successfully",
			data: user,
		};
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		return {
			status: ResponseStatus.Failure,
			message,
		};
	}
}

/**
 * Upsert a Google-authenticated user.
 */
async function upsert(user: Omit<User, "createdAt">): Promise<ServerResponse<User>> {
	try {
		const item: User = {
			...user,
			createdAt: new Date().toISOString(),
		};

		await ddb.send(
			new PutCommand({
				TableName: env.aws.usersTable,
				Item: {
					[DynamoDBAttr.PK]: `USER#${item.id}`,
					[DynamoDBAttr.SK]: DynamoDBAttr.META,
					[DynamoDBAttr.USER_NAME]: item.name,
					[DynamoDBAttr.USER_EMAIL]: item.email,
					[DynamoDBAttr.USER_ROLE]: item.role,
					[DynamoDBAttr.CREATED_AT]: item.createdAt,
				},
			})
		);

		return {
			status: ResponseStatus.Success,
			message: "User upserted successfully",
			data: item,
		};
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		return {
			status: ResponseStatus.Failure,
			message,
		};
	}
}

/**
 * Fetch a user by ID.
 */
async function getById(id: string): Promise<ServerResponse<User>> {
	try {
		const resp = await ddb.send(
			new GetCommand({
				TableName: env.aws.usersTable,
				Key: {
					[DynamoDBAttr.PK]: `USER#${id}`,
					[DynamoDBAttr.SK]: DynamoDBAttr.META,
				},
			})
		);

		if (!resp.Item) {
			return {
				status: ResponseStatus.Failure,
				message: "User not found",
			};
		}

		const it = resp.Item as Record<string, unknown>;
		const user: User = {
			id,
			name: it[DynamoDBAttr.USER_NAME] as string,
			email: it[DynamoDBAttr.USER_EMAIL] as string,
			role: it[DynamoDBAttr.USER_ROLE] as UserRole,
			createdAt: it[DynamoDBAttr.CREATED_AT] as string,
		};

		return {
			status: ResponseStatus.Success,
			message: "User fetched successfully",
			data: user,
		};
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		return {
			status: ResponseStatus.Failure,
			message,
		};
	}
}

const userService = { create, getByEmail, upsert, getById };

export default userService;
