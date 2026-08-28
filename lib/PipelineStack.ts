import path from "node:path";
import { StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { Code, LayerVersion, StartingPosition } from "aws-cdk-lib/aws-lambda";
import {
	DynamoEventSource,
	S3EventSourceV2,
} from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { Stack, type StackProps } from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import { EnterpriseTable } from "./constructs/EnterpriseTable";

export class PipelineStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// --------------------- S3 Bucket ------------------------

		const bucket = new Bucket(this, "StagingBucket", {
			bucketName: "acme-company-pipeline-bucket",
		});

		// ---------------------- DynamoDB ------------------------

		const table = new EnterpriseTable(this, "Database", {
			tableName: "pipeline-table",
			dynamoStream: StreamViewType.NEW_AND_OLD_IMAGES,
		});

		// --------------------- Functions ------------------------

		const powertoolsLayer = new LayerVersion(this, "PowertoolsLayer", {
			code: Code.fromAsset(
				path.resolve(import.meta.dirname, "./layers/powertools.zip"),
			),
		});

		const persistObjectsFunction = new NodejsFunction(this, "PersistObjects", {
			functionName: "persist-objects",
			entry: path.resolve(
				import.meta.dirname,
				"../src/persist-objects/handler.ts",
			),
			environment: {
				DYNAMODB_TABLE_NAME: table.tableName,
				POWERTOOLS_SERVICE_NAME: "persist-objects",
			},
			events: [
				new S3EventSourceV2(bucket, {
					events: [EventType.OBJECT_CREATED, EventType.OBJECT_REMOVED],
				}),
			],
			layers: [powertoolsLayer],
			bundling: {
				externalModules: ["@aws-sdk/*", "@aws-lambda-powertools/*"],
			},
		});

		bucket.grantRead(persistObjectsFunction);
		table.grantWriteData(persistObjectsFunction);

		new NodejsFunction(this, "StreamRecords", {
			functionName: "stream-records",
			entry: path.resolve(
				import.meta.dirname,
				"../src/stream-records/handler.ts",
			),
			environment: {
				POWERTOOLS_SERVICE_NAME: "stream-records",
			},
			events: [
				new DynamoEventSource(table, {
					startingPosition: StartingPosition.LATEST,
					reportBatchItemFailures: true,
				}),
			],
			layers: [powertoolsLayer],
			bundling: {
				externalModules: ["@aws-sdk/*", "@aws-lambda-powertools/*"],
			},
		});
	}
}
