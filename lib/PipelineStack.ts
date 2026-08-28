import path from "node:path";
import {
	AttributeType,
	StreamViewType,
	TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";
import {
	DynamoEventSource,
	S3EventSourceV2,
} from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { Stack, type StackProps } from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export class PipelineStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// --------------------- S3 Bucket ------------------------

		const bucket = new Bucket(this, "StagingBucket", {
			bucketName: "pipeline-bucket",
		});

		// ---------------------- DynamoDB ------------------------

		const table = new TableV2(this, "Database", {
			tableName: "pipeline-table",
			partitionKey: {
				name: "key",
				type: AttributeType.STRING,
			},
			dynamoStream: StreamViewType.NEW_AND_OLD_IMAGES,
		});

		// --------------------- Functions ------------------------

		const persistObjectsFunction = new NodejsFunction(this, "PersistObjects", {
			functionName: "persist-objects",
			entry: path.resolve(
				import.meta.dirname,
				"../src/persist-objects/handler.ts",
			),
			environment: {
				DYNAMODB_TABLE_NAME: table.tableName,
			},
			events: [
				new S3EventSourceV2(bucket, {
					events: [EventType.OBJECT_CREATED, EventType.OBJECT_REMOVED],
				}),
			],
		});

		bucket.grantRead(persistObjectsFunction);
		table.grantWriteData(persistObjectsFunction);

		new NodejsFunction(this, "StreamRecords", {
			functionName: "stream-records",
			entry: path.resolve(
				import.meta.dirname,
				"../src/stream-records/handler.ts",
			),
			events: [
				new DynamoEventSource(table, {
					startingPosition: StartingPosition.LATEST,
					reportBatchItemFailures: true,
				}),
			],
		});
	}
}
