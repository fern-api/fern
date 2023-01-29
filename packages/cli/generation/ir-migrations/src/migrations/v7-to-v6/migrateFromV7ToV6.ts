import { GeneratorName } from "@fern-api/generators-configuration";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V7_TO_V6_MIGRATION: IrMigration<
    IrVersions.V7.ir.IntermediateRepresentation,
    IrVersions.V6.ir.IntermediateRepresentation
> = {
    laterVersion: "v7",
    earlierVersion: "v6",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_EXPRESS]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v7): IrVersions.V6.ir.IntermediateRepresentation => {
        return {
            apiName: v7.apiName,
            apiDisplayName: v7.apiDisplayName,
            apiDocs: v7.apiDocs,
            auth: v7.auth,
            headers: v7.headers,
            types: v7.types,
            services: v7.services.map((service) => {
                const lastFernFilepathPart = service.name.fernFilepath[service.name.fernFilepath.length - 1];

                const originalName =
                    lastFernFilepathPart != null ? `${lastFernFilepathPart.originalName}Service` : "Service";
                const camelCase =
                    lastFernFilepathPart != null ? `${lastFernFilepathPart.originalName}Service` : "Service";
                const snakeCase =
                    lastFernFilepathPart != null ? `${lastFernFilepathPart.originalName}_service` : "service";
                const screamingSnakeCase = snakeCase.toUpperCase();
                const pascalCase =
                    lastFernFilepathPart != null ? `${lastFernFilepathPart.originalName}Service` : "Service";

                return {
                    ...service,
                    name: {
                        name: {
                            originalName,
                            camelCase: {
                                safeName: camelCase,
                                unsafeName: camelCase,
                            },
                            snakeCase: {
                                safeName: snakeCase,
                                unsafeName: snakeCase,
                            },
                            screamingSnakeCase: {
                                safeName: screamingSnakeCase,
                                unsafeName: screamingSnakeCase,
                            },
                            pascalCase: {
                                safeName: pascalCase,
                                unsafeName: pascalCase,
                            },
                        },
                        fernFilepath: service.name.fernFilepath,
                    },
                };
            }),
            errors: v7.errors,
            constants: v7.constants,
            environments: v7.environments,
            errorDiscriminationStrategy: v7.errorDiscriminationStrategy,
            sdkConfig: v7.sdkConfig,
        };
    },
};
