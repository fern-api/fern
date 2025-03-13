import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V57_TO_V56_MIGRATION: IrMigration<
    IrVersions.V57.ir.IntermediateRepresentation,
    IrVersions.V56.ir.IntermediateRepresentation
> = {
    laterVersion: "v57",
    earlierVersion: "v56",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.49.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.49.0",
        [GeneratorName.TYPESCRIPT]: "0.49.0",
        [GeneratorName.TYPESCRIPT_SDK]: "0.49.0",
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
        [GeneratorName.GO_FIBER]: "0.23.6",
        [GeneratorName.GO_MODEL]: "0.23.6",
        [GeneratorName.GO_SDK]: "0.37.0",
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: "1.12.0-rc11",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: "0.14.1"
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V56.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v57): IrVersions.V56.ir.IntermediateRepresentation => {
        return {
            ...v57,
            dynamic: v57.dynamic != null ? convertDynamicIr(v57.dynamic) : undefined
        };
    }
};

function convertDynamicIr(
    ir: IrVersions.V57.dynamic.DynamicIntermediateRepresentation
): IrVersions.V56.dynamic.DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertDynamicEndpoints(ir.endpoints)
    };
}

function convertDynamicEndpoints(
    endpoints: Record<string, IrVersions.V57.dynamic.Endpoint>
): Record<string, IrVersions.V56.dynamic.Endpoint> {
    return mapValues(endpoints, (endpoint) => convertDynamicEndpoint(endpoint));
}

function convertDynamicEndpoint(endpoint: IrVersions.V57.dynamic.Endpoint): IrVersions.V56.dynamic.Endpoint {
    return {
        ...endpoint,
        auth: endpoint.auth != null ? convertDynamicAuth(endpoint.auth) : undefined,
        examples: endpoint.examples != null ? convertDynamicExamples(endpoint.examples) : undefined
    };
}

function convertDynamicExamples(
    examples: IrVersions.V57.dynamic.EndpointExample[]
): IrVersions.V56.dynamic.EndpointExample[] {
    return examples.map((example) => convertDynamicExample(example));
}

function convertDynamicExample(
    example: IrVersions.V57.dynamic.EndpointExample
): IrVersions.V56.dynamic.EndpointExample {
    return {
        ...example,
        auth: example.auth != null ? convertDynamicAuthValues(example.auth) : undefined
    };
}

function convertDynamicAuth(auth: IrVersions.V57.dynamic.Auth): IrVersions.V56.dynamic.Auth | undefined {
    switch (auth.type) {
        case "basic":
            return IrVersions.V56.dynamic.Auth.basic(auth);
        case "bearer":
            return IrVersions.V56.dynamic.Auth.bearer(auth);
        case "header":
            return IrVersions.V56.dynamic.Auth.header(auth);
        case "oauth":
            return undefined;
        default:
            assertNever(auth);
    }
}

function convertDynamicAuthValues(
    auth: IrVersions.V57.dynamic.AuthValues
): IrVersions.V56.dynamic.AuthValues | undefined {
    switch (auth.type) {
        case "basic":
            return IrVersions.V56.dynamic.AuthValues.basic(auth);
        case "bearer":
            return IrVersions.V56.dynamic.AuthValues.bearer(auth);
        case "header":
            return IrVersions.V56.dynamic.AuthValues.header(auth);
        case "oauth":
            return undefined;
        default:
            assertNever(auth);
    }
}
