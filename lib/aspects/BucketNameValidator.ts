import { Annotations, type IAspect } from "aws-cdk-lib";
import { CfnBucket } from "aws-cdk-lib/aws-s3";
import type { IConstruct } from "constructs";

const COMPANY_NAME = "acme-company";

export class BucketNameValidator implements IAspect {
	public visit(node: IConstruct): void {
		if (node instanceof CfnBucket) {
			if (!node.bucketName?.includes(COMPANY_NAME)) {
				Annotations.of(node).addError(
					`Bucket name must contain '${COMPANY_NAME}'. Current name: ${node.bucketName}`,
				);
			}
		}
	}
}
