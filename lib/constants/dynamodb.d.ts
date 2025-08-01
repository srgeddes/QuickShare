export declare const DynamoDBAttr: {
    readonly PK: "PK";
    readonly SK: "SK";
    readonly META: "META";
    readonly CREATED_AT: "createdAt";
    readonly USER_PASSWORD: "password";
    readonly STATUS: "status";
    readonly CREATOR_ID: "creatorId";
    readonly USER_NAME: "name";
    readonly USER_EMAIL: "email";
    readonly USER_ROLE: "role";
    readonly SUB_TITLE: "title";
    readonly SUB_DESC: "description";
    readonly SUB_IMAGE_KEY: "imageKey";
    readonly USER_ID: "ownerId";
    readonly IMAGE_KEY: "imageKey";
    readonly IMAGE_NAME: "filename";
};
export type DynamoDBAttrKey = (typeof DynamoDBAttr)[keyof typeof DynamoDBAttr];
