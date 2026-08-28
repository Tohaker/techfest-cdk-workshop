import type { IAspect } from "aws-cdk-lib";
import { CfnBucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import type { IConstruct } from "constructs";

export class BucketSecurityEnforcer implements IAspect {
	public visit(node: IConstruct): void {
		if (node instanceof CfnBucket) {
			node.corsConfiguration = {
				corsRules: [
					{
						allowedMethods: [
							HttpMethods.POST,
							HttpMethods.PUT,
							HttpMethods.DELETE,
						],
						allowedOrigins: ["*"],
					},
				],
			};
			node.publicAccessBlockConfiguration = {
				blockPublicAcls: true,
				blockPublicPolicy: true,
				ignorePublicAcls: true,
				restrictPublicBuckets: true,
			};
		}
	}
}
