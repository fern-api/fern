import { GeneratorName } from "@fern-api/generators-configuration";
import { IrVersions } from "../../ir-versions";
import { IrMigrationContext } from "../../IrMigrationContext";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V11_TO_V10_MIGRATION: IrMigration<
    IrVersions.V11.ir.IntermediateRepresentation,
    IrVersions.V10.ir.IntermediateRepresentation
> = {
    laterVersion: "v11",
    earlierVersion: "v10",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_EXPRESS]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v11, context): IrVersions.V10.ir.IntermediateRepresentation => {
        return {
            apiName: v11.apiName,
            apiDisplayName: v11.apiDisplayName,
            apiDocs: v11.apiDocs,
            auth: convertAuth(v11.auth, context),
            headers: v11.headers,
            types: v11.types,
            errors: v11.errors,
            services: v11.services,
            constants: v11.constants,
            environments: v11.environments,
            errorDiscriminationStrategy: v11.errorDiscriminationStrategy,
            sdkConfig: v11.sdkConfig,
            rootPackage: v11.rootPackage,
            subpackages: v11.subpackages,
        };
    },
};

function convertAuth(auth: IrVersions.V11.auth.ApiAuth, context: IrMigrationContext): IrVersions.V10.auth.ApiAuth {
    return {
        docs: auth.docs,
        requirement: auth.requirement,
        schemes: auth.schemes.map((scheme) => convertAuthScheme(scheme, context)),
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
                    `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                        " does not support specifying an auth header prefix." +
                        ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                        " to a compatible version."
                );
            }
            return IrVersions.V10.auth.AuthScheme.header({
                docs: header.docs,
                availability: {
                    status: IrVersions.V10.commons.AvailabilityStatus.GeneralAvailability,
                    message: undefined,
                },
                name: {
                    name: header.name,
                    wireValue: header.header,
                },
                valueType: header.valueType,
            });
        },
        _unknown: () => {
            throw new Error("Unknown auth scheme: " + scheme._type);
        },
    });
}
