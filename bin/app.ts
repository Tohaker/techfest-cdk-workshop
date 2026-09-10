#!/usr/bin/env node
import { App, type Environment } from "aws-cdk-lib/core";
import { PipelineStack } from "../lib/PipelineStack";

const env: Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new PipelineStack(app, "TechfestCdkWorkshopStack", {
	env,
});
