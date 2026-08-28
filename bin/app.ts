#!/usr/bin/env node
import { App, Aspects, type Environment } from "aws-cdk-lib/core";
import { BucketNameValidator } from "../lib/aspects/BucketNameValidator";
import { BucketSecurityEnforcer } from "../lib/aspects/BucketSecurityEnforcer";
import { PowertoolsFunctionDefaults } from "../lib/blueprints/PowertoolsFunctionDefaults";
import { PipelineStack } from "../lib/PipelineStack";

const env: Environment = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

const app = new App({
	propertyInjectors: [new PowertoolsFunctionDefaults()],
});

const stack = new PipelineStack(app, "TechfestCdkWorkshopStack", {
	env,
});

Aspects.of(stack).add(new BucketNameValidator());
Aspects.of(stack).add(new BucketSecurityEnforcer());
