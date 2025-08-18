import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V59_TO_V58_MIGRATION: IrMigration<
    IrVersions.V59.ir.IntermediateRepresentation,
    IrVersions.V58.ir.IntermediateRepresentation
> = {
    laterVersion: "v59",
    earlierVersion: "v58",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "2.6.8",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "2.6.8",
        [GeneratorName.TYPESCRIPT]: "2.6.8",
        [GeneratorName.TYPESCRIPT_SDK]: "2.6.8",
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
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: "0.6.0",
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUST_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V58.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v59): IrVersions.V58.ir.IntermediateRepresentation => {
        return {
            ...v59,
            dynamic: v59.dynamic != null ? convertDynamicIr(v59.dynamic) : undefined,
            auth: v59.auth != null ? convertAuthIr(v59.auth) : undefined
        } as IrVersions.V58.ir.IntermediateRepresentation;
    }
};

function convertAuthIr(auth: IrVersions.V59.ApiAuth): IrVersions.V58.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.filter((scheme) => scheme.type !== "inferred") as IrVersions.V58.AuthScheme[]
    };
}

function convertDynamicIr(
    ir: IrVersions.V59.dynamic.DynamicIntermediateRepresentation
): IrVersions.V58.dynamic.DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertDynamicEndpoints(ir.endpoints)
    };
}

function convertDynamicEndpoints(
    endpoints: Record<string, IrVersions.V59.dynamic.Endpoint>
): Record<string, IrVersions.V58.dynamic.Endpoint> {
    return Object.fromEntries(
        Object.entries(endpoints)
            .map(([key, endpoint]) => [key, convertDynamicEndpoint(endpoint)])
            .filter(([_, endpoint]) => endpoint != null)
    );
}

function convertDynamicEndpoint(
    endpoint: IrVersions.V59.dynamic.Endpoint
): IrVersions.V58.dynamic.Endpoint | undefined {
    return {
        ...endpoint,
        examples: endpoint.examples != null ? convertDynamicExamples(endpoint.examples) : undefined,
        auth: convertDynamicAuth(endpoint.auth)
    };
}

function convertDynamicAuth(auth: IrVersions.V59.dynamic.Auth | undefined): IrVersions.V58.dynamic.Auth | undefined {
    if (auth == null) {
        return auth as IrVersions.V58.dynamic.Auth | undefined;
    }
    if (auth.type === "inferred") {
        return undefined;
    }
    return auth as IrVersions.V58.dynamic.Auth;
}

function convertDynamicExamples(
    examples: IrVersions.V59.dynamic.EndpointExample[]
): IrVersions.V58.dynamic.EndpointExample[] {
    return examples.map((example) => convertDynamicExample(example)).filter((example) => example != null);
}

function convertDynamicExample(
    example: IrVersions.V59.dynamic.EndpointExample
): IrVersions.V58.dynamic.EndpointExample | undefined {
    return {
        ...example,
        auth: convertDynamicExampleAuth(example.auth)
    };
}

function convertDynamicExampleAuth(
    auth: IrVersions.V59.dynamic.AuthValues | undefined
): IrVersions.V58.dynamic.AuthValues | undefined {
    if (auth == null) {
        return auth as IrVersions.V58.dynamic.AuthValues | undefined;
    }
    if (auth.type === "inferred") {
        return undefined;
    }
    return auth as IrVersions.V58.dynamic.AuthValues;
}
