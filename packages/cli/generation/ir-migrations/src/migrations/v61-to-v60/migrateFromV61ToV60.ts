import { GeneratorName } from "@fern-api/configuration-loader";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V61_TO_V60_MIGRATION: IrMigration<
    IrVersions.V61.ir.IntermediateRepresentation,
    IrVersions.V60.ir.IntermediateRepresentation
> = {
    laterVersion: "v61",
    earlierVersion: "v60",
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
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: "0.0.4",
        [GeneratorName.CSHARP_SDK]: "2.4.0",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V60.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (
        v61: IrVersions.V61.IntermediateRepresentation
    ): IrVersions.V60.ir.IntermediateRepresentation => {
        return {
            ...v61,
            dynamic: v61.dynamic != null ? convertDynamic(v61.dynamic) : undefined
        };
    }
};

function convertDynamic(
    dynamic: IrVersions.V61.dynamic.DynamicIntermediateRepresentation
): IrVersions.V60.dynamic.DynamicIntermediateRepresentation {
    return {
        ...dynamic,
        endpoints: convertDynamicEndpoints(dynamic.endpoints)
    };
}

function convertDynamicEndpoints(
    endpoints: Record<IrVersions.V61.dynamic.EndpointId, IrVersions.V61.dynamic.Endpoint>
): Record<IrVersions.V60.dynamic.EndpointId, IrVersions.V60.dynamic.Endpoint> {
    return Object.fromEntries(
        Object.entries(endpoints)
            .map(([key, endpoint]) => [key, convertDynamicEndpoint(endpoint)])
            .filter(([_, endpoint]) => endpoint != null)
    );
}

function convertDynamicEndpoint(
    endpoint: IrVersions.V61.dynamic.Endpoint
): IrVersions.V60.dynamic.Endpoint | undefined {
    return {
        ...endpoint,
        response: convertDynamicEndpointResponse(endpoint.response)
    };
}

function convertDynamicEndpointResponse(response: IrVersions.V61.dynamic.Response): IrVersions.V60.dynamic.Response {
    return IrVersions.V61.dynamic.Response._visit<IrVersions.V60.dynamic.Response>(response, {
        json: IrVersions.V60.dynamic.Response.json,
        streaming: IrVersions.V60.dynamic.Response.json,
        streamParameter: IrVersions.V60.dynamic.Response.json,
        fileDownload: IrVersions.V60.dynamic.Response.json,
        text: IrVersions.V60.dynamic.Response.json,
        bytes: IrVersions.V60.dynamic.Response.json,
        _other: IrVersions.V60.dynamic.Response.json
    });
}
