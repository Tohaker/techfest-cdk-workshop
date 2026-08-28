import {
	AttributeType,
	type TablePropsV2,
	TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import type { Construct } from "constructs";

/**
 * Custom DynamoDB Table construct. Demonstrates how a centrally-controlled
 * enterprise-level DynamoDB Table construct may be provided by a Platform Team.
 */
export class EnterpriseTable extends TableV2 {
	constructor(
		scope: Construct,
		id: string,
		props?: Omit<TablePropsV2, "partitionKey">,
	) {
		super(scope, id, {
			partitionKey: {
				name: "key",
				type: AttributeType.STRING,
			},
			...props,
		});
	}
}
