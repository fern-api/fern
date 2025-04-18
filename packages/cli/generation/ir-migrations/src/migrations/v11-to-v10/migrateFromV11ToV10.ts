import { GeneratorName } from "@fern-api/configuration-loader";

import { IrMigrationContext } from "../../IrMigrationContext";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V11_TO_V10_MIGRATION: IrMigration<
    IrVersions.V11.ir.IntermediateRepresentation,
    IrVersions.V10.ir.IntermediateRepresentation
> = {
    laterVersion: "v11",
    earlierVersion: "v10",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.5.0-rc0-1-g83a12940",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.5.0-rc0-1-g83a12940",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.0.134-15-ge1ac358",
        [GeneratorName.JAVA_SDK]: "0.0.134-15-ge1ac358",
        [GeneratorName.JAVA_SPRING]: "0.0.134-15-ge1ac358",
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNotCreatedYet,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: "0.0.40-1-g9aa2117",
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) => ir,
    migrateBackwards: (v11, context): IrVersions.V10.ir.IntermediateRepresentation => {
        return {
            ...v11,
            auth: convertAuth(v11.auth, context)
        };
    }
};

function convertAuth(auth: IrVersions.V11.auth.ApiAuth, context: IrMigrationContext): IrVersions.V10.auth.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.map((scheme) => convertAuthScheme(scheme, context))
    };
}

function convertAuthScheme(
    scheme: IrVersions.V11.auth.AuthScheme,
    { taskContext, targetGenerator }: IrMigrationContext
): IrVersions.V10.auth.AuthScheme {
    return IrVersions.V11.auth.AuthScheme._visit<IrVersions.V10.auth.AuthScheme>(scheme, {
        bearer: IrVersions.V10.auth.AuthScheme.bearer,
        basic: IrVersions.V10.auth.AuthScheme.basic,
        header: (header) => {
            if (header.prefix != null) {
                return taskContext.failAndThrow(
                    targetGenerator != null
                        ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                              " does not support specifying an auth header prefix." +
                              ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                              " to a compatible version."
                        : "Cannot backwards-migrate IR because this IR contains an auth header prefix."
                );
            }
            return IrVersions.V10.auth.AuthScheme.header({
                docs: header.docs,
                availability: {
                    status: IrVersions.V10.commons.AvailabilityStatus.GeneralAvailability,
                    message: undefined
                },
                name: {
                    name: header.name,
                    wireValue: header.header
                },
                valueType: header.valueType
            });
        },
        _unknown: () => {
            throw new Error("Unknown auth scheme: " + scheme._type);
        }
    });
}
