import { hash } from "node:crypto";
import { Logger } from "@aws-lambda-powertools/logger";
import {
	DeleteItemCommand,
	DynamoDBClient,
	PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { marshall } from "@aws-sdk/util-dynamodb";
import type { S3Event } from "aws-lambda";

const logger = new Logger();

const s3Client = new S3Client();
const dynamodbClient = new DynamoDBClient();

export const handler = async (event: S3Event) => {
	const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

	if (!DYNAMODB_TABLE_NAME) {
		throw new Error("DYNAMODB_TABLE_NAME parameter is unset");
	}

	for await (const record of event.Records) {
		const key = record.s3.object.key;
		const bucket = record.s3.bucket.name;

		logger.info("S3 Object Change", {
			key,
			event: record.eventName,
		});

		if (record.eventName.includes("ObjectCreated")) {
			const object = await s3Client.send(
				new GetObjectCommand({
					Key: key,
					Bucket: bucket,
				}),
			);

			const item = marshall({
				key: record.s3.object.key,
				size: record.s3.object.size,
				md5: object.Body
					? hash("md5", await object.Body.transformToByteArray())
					: "no-body",
			});

			await dynamodbClient.send(
				new PutItemCommand({
					TableName: DYNAMODB_TABLE_NAME,
					Item: item,
				}),
			);

			logger.info("Successfully PUT item onto DynamoDB Table", {
				table: DYNAMODB_TABLE_NAME,
				key,
			});
		} else if (record.eventName.includes("ObjectRemoved")) {
			await dynamodbClient.send(
				new DeleteItemCommand({
					TableName: DYNAMODB_TABLE_NAME,
					Key: marshall({ key: record.s3.object.key }),
				}),
			);

			logger.info("Successfully DELETED item from DynamoDB Table", {
				table: DYNAMODB_TABLE_NAME,
				key,
			});
		}
	}
};
