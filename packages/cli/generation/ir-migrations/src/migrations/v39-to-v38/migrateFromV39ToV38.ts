import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V39_TO_V38_MIGRATION: IrMigration<
    IrVersions.V39.ir.IntermediateRepresentation,
    IrVersions.V38.ir.IntermediateRepresentation
> = {
    laterVersion: "v39",
    earlierVersion: "v38",
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
        [GeneratorName.PYTHON_FASTAPI]: "0.9.0-rc1",
        [GeneratorName.PYTHON_PYDANTIC]: "0.9.0-rc1",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "1.4.0-rc1",
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: "0.7.0-rc0",
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V38.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (V39, _context): IrVersions.V38.ir.IntermediateRepresentation => {
        return {
            ...V39,
            auth: {
                ...V39.auth,
                schemes: V39.auth.schemes.map((scheme) => convertAuthScheme(scheme))
            }
        };
    }
};

function convertAuthScheme(scheme: IrVersions.V39.AuthScheme): IrVersions.V38.AuthScheme {
    switch (scheme.type) {
        case "basic":
            return IrVersions.V38.AuthScheme.basic(scheme);
        case "bearer":
            return IrVersions.V38.AuthScheme.bearer(scheme);
        case "header":
            return IrVersions.V38.AuthScheme.header(scheme);
        case "oauth":
            return IrVersions.V38.AuthScheme.bearer({
                docs: scheme.docs,
                token: {
                    originalName: "token",
                    camelCase: {
                        unsafeName: "token",
                        safeName: "token"
                    },
                    pascalCase: {
                        unsafeName: "Token",
                        safeName: "Token"
                    },
                    snakeCase: {
                        unsafeName: "token",
                        safeName: "token"
                    },
                    screamingSnakeCase: {
                        unsafeName: "TOKEN",
                        safeName: "TOKEN"
                    }
                },
                tokenEnvVar: undefined
            });
        default:
            assertNever(scheme);
    }
}
