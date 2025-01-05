import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever, isNonNullish } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V44_TO_V43_MIGRATION: IrMigration<
    IrVersions.V44.ir.IntermediateRepresentation,
    IrVersions.V43.ir.IntermediateRepresentation
> = {
    laterVersion: "v44",
    earlierVersion: "v43",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V43.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (V44, _context): IrVersions.V43.ir.IntermediateRepresentation => {
        return {
            ...V44,
            services: Object.fromEntries(
                Object.entries(V44.services).map(([serviceId, service]): [string, IrVersions.V43.HttpService] => {
                    return [
                        serviceId,
                        {
                            ...service,
                            endpoints: service.endpoints.map(
                                (endpoint): IrVersions.V43.HttpEndpoint => ({
                                    ...endpoint,
                                    examples: endpoint.examples
                                        .map((example) => {
                                            return convertHttpExample({ example });
                                        })
                                        .filter(isNonNullish)
                                })
                            )
                        }
                    ];
                })
            )
        };
    }
};

function convertHttpExample({
    example
}: {
    example: IrVersions.V44.HttpEndpointExample;
}): IrVersions.V43.HttpEndpointExample | undefined {
    return example._visit<IrVersions.V43.HttpEndpointExample | undefined>({
        userProvided: (example) => {
            return IrVersions.V43.HttpEndpointExample.userProvided(convertExampleEndpoint({ example }));
        },
        generated: (example) => {
            return IrVersions.V43.HttpEndpointExample.generated(convertExampleEndpoint({ example }));
        },
        _other: () => undefined
    });
}

function convertExampleEndpoint({
    example
}: {
    example: IrVersions.V44.ExampleEndpointCall;
}): IrVersions.V43.ExampleEndpointCall {
    return {
        ...example,
        response: convertExampleResponse({ example: example.response })
    };
}

function convertExampleResponse({
    example
}: {
    example: IrVersions.V44.ExampleResponse;
}): IrVersions.V43.ExampleResponse {
    /* eslint-disable no-fallthrough */
    switch (example.type) {
        case "ok":
            return convertExampleSuccessResponse({ example: example.value });
        case "error":
            return IrVersions.V43.ExampleResponse.error(example);
        default:
            assertNever(example);
    }
    /* eslint-enable no-fallthrough */
}

function convertExampleSuccessResponse({
    example
}: {
    example: IrVersions.V44.ExampleEndpointSuccessResponse;
}): IrVersions.V43.ExampleResponse {
    switch (example.type) {
        case "body":
            return IrVersions.V43.ExampleResponse.ok({ body: example.value });
        case "sse":
            return IrVersions.V43.ExampleResponse.ok({
                body: undefined
            });
        case "stream":
            return IrVersions.V43.ExampleResponse.ok({
                body: undefined
            });
        default:
            assertNever(example);
    }
}
