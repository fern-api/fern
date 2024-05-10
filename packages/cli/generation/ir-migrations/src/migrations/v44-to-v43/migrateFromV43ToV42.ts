import { GeneratorName } from "@fern-api/configuration";
import { identity } from "lodash-es";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V44_TO_V43_MIGRATION: IrMigration<
    IrVersions.V44.ir.IntermediateRepresentation,
    IrVersions.V43.ir.IntermediateRepresentation
> = {
    laterVersion: "v44",
    earlierVersion: "v43",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.17.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.17.0",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.13.0",
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
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V42.IntermediateRepresentation.jsonOrThrow(ir, {
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
                                    examples: endpoint.examples.map((example) =>
                                        example._visit<IrVersions.V43.HttpEndpointExample>({
                                            userProvided: (endpointCall) =>
                                                IrVersions.V43.HttpEndpointExample.userProvided({
                                                    ...endpointCall,
                                                    response:
                                                        endpointCall.response._visit<IrVersions.V43.ExampleResponse>({
                                                            ok: (ok) =>
                                                                ok._visit<IrVersions.V43.ExampleResponse>({
                                                                    body: (body) =>
                                                                        IrVersions.V43.ExampleResponse.ok({ body }),
                                                                    stream: () =>
                                                                        IrVersions.V43.ExampleResponse.ok({
                                                                            body: undefined
                                                                        }),
                                                                    sse: () =>
                                                                        IrVersions.V43.ExampleResponse.ok({
                                                                            body: undefined
                                                                        }),
                                                                    _other: identity
                                                                }),
                                                            error: (error) =>
                                                                IrVersions.V43.ExampleResponse.error(error),
                                                            _other: identity
                                                        })
                                                }),
                                            generated: (endpointCall) =>
                                                IrVersions.V43.HttpEndpointExample.generated({
                                                    ...endpointCall,
                                                    response:
                                                        endpointCall.response._visit<IrVersions.V43.ExampleResponse>({
                                                            ok: (ok) =>
                                                                ok._visit<IrVersions.V43.ExampleResponse>({
                                                                    body: (body) =>
                                                                        IrVersions.V43.ExampleResponse.ok({ body }),
                                                                    stream: () =>
                                                                        IrVersions.V43.ExampleResponse.ok({
                                                                            body: undefined
                                                                        }),
                                                                    sse: () =>
                                                                        IrVersions.V43.ExampleResponse.ok({
                                                                            body: undefined
                                                                        }),
                                                                    _other: identity
                                                                }),
                                                            error: (error) =>
                                                                IrVersions.V43.ExampleResponse.error(error),
                                                            _other: identity
                                                        })
                                                }),
                                            _other: identity
                                        })
                                    )
                                })
                            )
                        }
                    ];
                })
            )
        };
    }
};
