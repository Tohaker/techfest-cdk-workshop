import { Mixin } from "aws-cdk-lib";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import type { IConstruct } from "constructs";

export class TableReplication extends Mixin {
	public supports(construct: IConstruct): boolean {
		return construct instanceof TableV2;
	}

	public applyTo(construct: IConstruct): void {
		if (construct instanceof TableV2) {
			construct.addReplica({
				region: "us-east-2",
				deletionProtection: true,
			});
		}
	}
}
