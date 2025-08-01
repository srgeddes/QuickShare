import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Bucket, BlockPublicAccess, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy, CfnOutput } from "aws-cdk-lib";

import { DynamoDBAttr } from "../../lib/constants/dynamodb";

export class CdkStack extends cdk.Stack {
	public readonly bucket: Bucket;
	public readonly usersTable: Table;
	public readonly quickSharesTable: Table;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// S3
		this.bucket = new Bucket(this, "QuickShareImages", {
			bucketName: "quickshare-images",
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			removalPolicy: RemovalPolicy.DESTROY,
			cors: [
				{
					allowedMethods: [HttpMethods.PUT, HttpMethods.POST, HttpMethods.GET],
					allowedOrigins: ["*"],
					allowedHeaders: ["*"],
				},
			],
		});

		// Users table
		this.usersTable = new Table(this, "UsersTable", {
			tableName: "Users",
			partitionKey: { name: DynamoDBAttr.PK, type: AttributeType.STRING },
			sortKey: { name: DynamoDBAttr.SK, type: AttributeType.STRING },
			billingMode: BillingMode.PAY_PER_REQUEST,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		// QuickShares table
		this.quickSharesTable = new Table(this, "QuickSharesTable", {
			tableName: "QuickShares",
			partitionKey: { name: DynamoDBAttr.PK, type: AttributeType.STRING },
			sortKey: { name: DynamoDBAttr.SK, type: AttributeType.STRING },
			billingMode: BillingMode.PAY_PER_REQUEST,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		// GSI: by creatorId
		this.quickSharesTable.addGlobalSecondaryIndex({
			indexName: "GSI1",
			partitionKey: { name: DynamoDBAttr.CREATOR_ID, type: AttributeType.STRING },
		});

		// GSI: by status
		this.quickSharesTable.addGlobalSecondaryIndex({
			indexName: "GSI2",
			partitionKey: { name: DynamoDBAttr.STATUS, type: AttributeType.STRING },
		});

		// expose names
		new CfnOutput(this, "BucketName", { value: this.bucket.bucketName });
		new CfnOutput(this, "UsersTableName", { value: this.usersTable.tableName });
		new CfnOutput(this, "QuickSharesTableName", { value: this.quickSharesTable.tableName });
	}
}
