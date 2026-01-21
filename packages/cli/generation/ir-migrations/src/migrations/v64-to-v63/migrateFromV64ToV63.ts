import { GeneratorName } from "@fern-api/configuration-loader";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V64_TO_V63_MIGRATION: IrMigration<
    IrVersions.V64.ir.IntermediateRepresentation,
    IrVersions.V63.ir.IntermediateRepresentation
> = {
    laterVersion: "v64",
    earlierVersion: "v63",
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
        IrSerialization.V63.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v64: IrVersions.V64.IntermediateRepresentation
    ): IrVersions.V63.ir.IntermediateRepresentation => {
        return {
            ...v64,
            auth: convertApiAuth(v64.auth)
        };
    }
};

function convertApiAuth(auth: IrVersions.V64.ApiAuth): IrVersions.V63.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.map((scheme) => convertAuthScheme(scheme))
    };
}

function convertAuthScheme(scheme: IrVersions.V64.AuthScheme): IrVersions.V63.AuthScheme {
    switch (scheme.type) {
        case "basic":
            return IrVersions.V63.AuthScheme.basic(scheme);
        case "bearer":
            return IrVersions.V63.AuthScheme.bearer(scheme);
        case "header":
            return IrVersions.V63.AuthScheme.header(scheme);
        case "oauth":
            return IrVersions.V63.AuthScheme.oauth({
                ...scheme,
                configuration: convertOAuthConfiguration(scheme.configuration)
            });
        case "inferred":
            return IrVersions.V63.AuthScheme.inferred(scheme as unknown as IrVersions.V63.auth.InferredAuthScheme);
        default:
            throw new Error("Unknown AuthScheme type");
    }
}

function convertOAuthConfiguration(config: IrVersions.V64.OAuthConfiguration): IrVersions.V63.OAuthConfiguration {
    switch (config.type) {
        case "clientCredentials":
            return IrVersions.V63.OAuthConfiguration.clientCredentials({
                clientIdEnvVar: config.clientIdEnvVar,
                clientSecretEnvVar: config.clientSecretEnvVar,
                tokenPrefix: config.tokenPrefix,
                tokenHeader: config.tokenHeader,
                scopes: config.scopes,
                tokenEndpoint: config.tokenEndpoint,
                refreshEndpoint: config.refreshEndpoint
            });
        case "authorizationCode":
        case "password":
        case "deviceCode":
        case "tokenExchange":
        case "refreshToken":
            return IrVersions.V63.OAuthConfiguration.clientCredentials({
                clientIdEnvVar: config.clientIdEnvVar,
                clientSecretEnvVar: config.clientSecretEnvVar,
                tokenPrefix: config.tokenPrefix,
                tokenHeader: config.tokenHeader,
                scopes: config.scopes,
                tokenEndpoint: config.tokenEndpoint,
                refreshEndpoint: config.refreshEndpoint
            });
        default:
            throw new Error(`Unknown OAuthConfiguration type: ${(config as { type: string }).type}`);
    }
}
