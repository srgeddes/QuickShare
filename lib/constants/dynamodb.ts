export const DynamoDBAttr = {
	PK: "PK",
	SK: "SK",
	META: "META",
	CREATED_AT: "createdAt",
	USER_PASSWORD: "password",
	STATUS: "status",
	CREATOR_ID: "creatorId",
	USER_NAME: "name",
	USER_EMAIL: "email",
	USER_ROLE: "role",
	SUB_TITLE: "title",
	SUB_DESC: "description",
	SUB_IMAGE_KEY: "imageKey",
	USER_ID: "ownerId",
	IMAGE_KEY: "imageKey",
	IMAGE_NAME: "filename",
} as const;
export type DynamoDBAttrKey = (typeof DynamoDBAttr)[keyof typeof DynamoDBAttr];
