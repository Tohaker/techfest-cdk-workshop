import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib/core";
import { PipelineStack } from "../lib/PipelineStack";

describe("PipelineStack", () => {
	const app = new App();

	const stack = new PipelineStack(app, "TestStack");

	const template = Template.fromStack(stack);

	it("should create an S3 bucket", () => {
		template.hasResourceProperties("AWS::S3::Bucket", {
			BucketName: "pipeline-bucket",
		});
	});
});
