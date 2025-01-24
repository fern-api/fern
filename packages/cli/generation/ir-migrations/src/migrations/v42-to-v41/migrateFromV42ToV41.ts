import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V42_TO_V41_MIGRATION: IrMigration<
    IrVersions.V42.ir.IntermediateRepresentation,
    IrVersions.V41.ir.IntermediateRepresentation
> = {
    laterVersion: "v42",
    earlierVersion: "v41",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.8.0-rc0",
        [GeneratorName.JAVA_SDK]: "0.9.0-rc0",
        [GeneratorName.JAVA_SPRING]: "0.8.0-rc0",
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
        IrSerialization.V41.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (V42, _context): IrVersions.V41.ir.IntermediateRepresentation => {
        return {
            ...V42,
            auth: {
                ...V42.auth,
                schemes: V42.auth.schemes.map((scheme) => convertAuthScheme(scheme))
            }
        };
    }
};

function convertAuthScheme(scheme: IrVersions.V42.AuthScheme): IrVersions.V41.AuthScheme {
    switch (scheme.type) {
        case "basic":
            return IrVersions.V41.AuthScheme.basic(scheme);
        case "bearer":
            return IrVersions.V41.AuthScheme.bearer(scheme);
        case "header":
            return IrVersions.V41.AuthScheme.header(scheme);
        case "oauth":
            return IrVersions.V41.AuthScheme.oauth(convertOAuthScheme(scheme));
        default:
            assertNever(scheme);
    }
}

function convertOAuthScheme(scheme: IrVersions.V42.OAuthScheme): IrVersions.V41.OAuthScheme {
    switch (scheme.configuration.type) {
        case "clientCredentials":
            return {
                ...scheme,
                configuration: IrVersions.V41.OAuthConfiguration.clientCredentials({
                    ...scheme.configuration,
                    tokenEndpoint: {
                        ...scheme.configuration.tokenEndpoint,
                        endpointReference: scheme.configuration.tokenEndpoint.endpointReference.endpointId
                    },
                    refreshEndpoint:
                        scheme.configuration.refreshEndpoint != null
                            ? {
                                  ...scheme.configuration.refreshEndpoint,
                                  endpointReference: scheme.configuration.refreshEndpoint?.endpointReference.endpointId
                              }
                            : undefined
                })
            };
        default:
            assertNever(scheme.configuration.type);
    }
}
