import path from "node:path";
import {
	type InjectionContext,
	type IPropertyInjector,
	Stack,
} from "aws-cdk-lib";
import { Code, type ILayerVersion, LayerVersion } from "aws-cdk-lib/aws-lambda";
import {
	NodejsFunction,
	type NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

export class PowertoolsFunctionDefaults implements IPropertyInjector {
	public readonly constructUniqueId: string;

	constructor() {
		this.constructUniqueId = NodejsFunction.PROPERTY_INJECTION_ID;
	}

	public inject(originalProps: any, context: InjectionContext) {
		const originalFunctionProps: NodejsFunctionProps = originalProps;

		const parentScope = context.scope;
		const stack = Stack.of(parentScope);

		const layerId = "PowertoolsLayer";

		const existingPowertoolsLayer = stack.node.tryFindChild(layerId) as
			| ILayerVersion
			| undefined;

		const powertoolsLayer =
			existingPowertoolsLayer ??
			new LayerVersion(stack, layerId, {
				code: Code.fromAsset(
					path.resolve(import.meta.dirname, "../layers/powertools.zip"),
				),
			});

		const environment: NodejsFunctionProps["environment"] = {
			POWERTOOLS_SERVICE_NAME:
				originalFunctionProps.functionName ?? "service_undefined",
			...originalFunctionProps.environment,
		};

		const layers = originalFunctionProps.layers ?? [];

		layers.push(powertoolsLayer);

		return {
			...originalFunctionProps,
			environment,
			layers,
			bundling: {
				...originalFunctionProps.bundling,
				externalModules: [
					...(originalFunctionProps.bundling?.externalModules ?? []),
					"@aws-sdk/*",
					"@aws-lambda-powertools/*",
				],
			},
		};
	}
}
