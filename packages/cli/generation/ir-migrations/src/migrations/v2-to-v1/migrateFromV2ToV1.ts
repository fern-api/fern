import { GeneratorName } from "@fern-api/generators-configuration";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V2_TO_V1_MIGRATION: IrMigration<
    IrVersions.V2.ir.IntermediateRepresentation,
    IrVersions.V1.ir.IntermediateRepresentation
> = {
    laterVersion: "v2",
    earlierVersion: "v1",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.246",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.264",
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: undefined,
        [GeneratorName.STOPLIGHT]: undefined,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.GO]: AlwaysRunMigration,
    },
    migrateBackwards: (v2): IrVersions.V1.ir.IntermediateRepresentation => {
        return {
            apiName: v2.apiName,
            auth: v2.auth,
            headers: v2.headers,
            types: v2.types,
            services: v2.services,
            constants: v2.constants,
            constantsV2: v2.constantsV2,
            defaultEnvironment: v2.defaultEnvironment,
            environments: v2.environments,
            errorDiscriminant: v2.errorDiscriminant,
            errorDiscriminationStrategy: v2.errorDiscriminationStrategy,
            sdkConfig: v2.sdkConfig,
            errors: v2.errors.map(
                (error): IrVersions.V1.errors.ErrorDeclaration => ({
                    name: error.name,
                    docs: error.docs,
                    discriminantValue: {
                        originalValue: error.discriminantValueV4.name.unsafeName.originalValue,
                        camelCase: error.discriminantValueV4.name.unsafeName.camelCase,
                        pascalCase: error.discriminantValueV4.name.unsafeName.pascalCase,
                        snakeCase: error.discriminantValueV4.name.unsafeName.snakeCase,
                        screamingSnakeCase: error.discriminantValueV4.name.unsafeName.screamingSnakeCase,
                        wireValue: error.discriminantValueV4.wireValue,
                    },
                    discriminantValueV2: error.discriminantValueV2,
                    discriminantValueV3: error.discriminantValueV3,
                    discriminantValueV4: error.discriminantValueV4,
                    type: error.type,
                    typeV2: error.typeV2,
                    typeV3: error.typeV3,
                    http: error.http,
                    statusCode: error.statusCode,
                })
            ),
        };
    },
};
