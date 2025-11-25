import { GeneratorName } from "@fern-api/configuration-loader";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V62_TO_V61_MIGRATION: IrMigration<
    IntermediateRepresentation,
    IrVersions.V61.ir.IntermediateRepresentation
> = {
    laterVersion: "v62",
    earlierVersion: "v61",
    firstGeneratorVersionToConsumeNewIR: {
        // All generators currently expect v61, so they haven't been updated to v62 yet
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
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V61.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (v62: IntermediateRepresentation): IrVersions.V61.ir.IntermediateRepresentation => {
        return {
            ...v62,
            errors: resolveErrorDeclarationConflicts(v62.errors),
            services: Object.fromEntries(
                Object.entries(v62.services).map(([key, service]) => [key, convertHttpService(service)])
            )
        };
    }
};

function resolveErrorDeclarationConflicts(
    errors: IntermediateRepresentation["errors"]
): Record<string, IrVersions.V61.errors.ErrorDeclaration> {
    const resolvedErrors: Record<string, IrVersions.V61.errors.ErrorDeclaration> = {};

    for (const [errorId, errorDeclaration] of Object.entries(errors)) {
        const isWildcard = errorDeclaration.isWildcardStatusCode === true;

        if (!isWildcard) {
            // For non-wildcard errors, set isWildcardStatusCode to undefined since v61 didn't use it
            const { isWildcardStatusCode, ...v61ErrorDeclaration } = errorDeclaration;
            resolvedErrors[errorId] = {
                ...v61ErrorDeclaration,
                isWildcardStatusCode: undefined
            } as IrVersions.V61.errors.ErrorDeclaration;
        }
        // Wildcard errors are not supported in v61, so we don't include them in the resolved errors
    }

    return resolvedErrors;
}

function convertHttpService(service: IntermediateRepresentation["services"][string]): IrVersions.V61.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map(convertHttpEndpoint)
    } as IrVersions.V61.http.HttpService;
}

function convertHttpEndpoint(
    endpoint: IntermediateRepresentation["services"][string]["endpoints"][number]
): IrVersions.V61.http.HttpEndpoint {
    return {
        ...endpoint,
        errors: endpoint.errors
    } as IrVersions.V61.http.HttpEndpoint;
}
