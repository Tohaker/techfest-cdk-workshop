import {
	BatchProcessor,
	EventType,
	processPartialResponse,
} from "@aws-lambda-powertools/batch";
import { Logger } from "@aws-lambda-powertools/logger";
import type { Context, DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda";

const logger = new Logger();
const processor = new BatchProcessor(EventType.DynamoDBStreams, { logger });

const recordHandler = async (record: DynamoDBRecord) => {
	switch (record.eventName) {
		case "INSERT": {
			logger.info("Record inserted to table", {
				table: record.eventSource,
				key: record.dynamodb?.NewImage?.key,
			});
			break;
		}
		case "MODIFY": {
			logger.info("Record modified in table", {
				table: record.eventSource,
				key: record.dynamodb?.NewImage?.key,
			});
			break;
		}
		case "REMOVE": {
			logger.info("Record removed from table", {
				table: record.eventSource,
				key: record.dynamodb?.OldImage?.key,
			});
			break;
		}
	}
};

export const handler = (event: DynamoDBStreamEvent, context: Context) =>
	processPartialResponse(event, recordHandler, processor, {
		context,
	});
