import { GeneratorName } from "@fern-api/generators-configuration";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V6_TO_V5_MIGRATION: IrMigration<
    IrVersions.V6.ir.IntermediateRepresentation,
    IrVersions.V5.ir.IntermediateRepresentation
> = {
    laterVersion: "v6",
    earlierVersion: "v5",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v6, { taskContext, targetGenerator }): IrVersions.V5.ir.IntermediateRepresentation => {
        return {
            apiName: v6.apiName,
            apiDisplayName: v6.apiDisplayName,
            apiDocs: v6.apiDocs,
            auth: v6.auth,
            headers: v6.headers,
            types: v6.types,
            services: v6.services,
            errors: v6.errors,
            constants: v6.constants,
            defaultEnvironment: v6.environments?.defaultEnvironment,
            environments:
                v6.environments != null
                    ? IrVersions.V6.environment.Environments._visit<IrVersions.V5.environment.Environment[]>(
                          v6.environments.environments,
                          {
                              singleBaseUrl: (singleBaseUrlEnvironments): IrVersions.V5.environment.Environment[] =>
                                  singleBaseUrlEnvironments.environments,
                              multipleBaseUrls: () => {
                                  return taskContext.failAndThrow(
                                      `Genereator ${targetGenerator.name}@${targetGenerator.version}` +
                                          " does not support specifying multiple URLs for a single environment." +
                                          ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                                          " to a compatible version."
                                  );
                              },
                              _unknown: () => {
                                  throw new Error("Unknown Environments: " + v6.environments?.environments.type);
                              },
                          }
                      )
                    : [],
            errorDiscriminationStrategy: v6.errorDiscriminationStrategy,
            sdkConfig: v6.sdkConfig,
        };
    },
};
