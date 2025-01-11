import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V6_TO_V5_MIGRATION: IrMigration<
    IrVersions.V6.ir.IntermediateRepresentation,
    IrVersions.V5.ir.IntermediateRepresentation
> = {
    laterVersion: "v6",
    earlierVersion: "v5",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.257-4-ge56e5d2",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.264",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "0.0.35-1-g071a04a",
        [GeneratorName.PYTHON_PYDANTIC]: "0.0.35-1-g071a04a",
        [GeneratorName.OPENAPI]: "0.0.16-1-ga2c0ada",
        [GeneratorName.STOPLIGHT]: GeneratorWasNotCreatedYet,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNotCreatedYet,
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
    migrateBackwards: (v6, { taskContext, targetGenerator }): IrVersions.V5.ir.IntermediateRepresentation => {
        return {
            ...v6,
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
                                      targetGenerator != null
                                          ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                                                " does not support specifying multiple URLs for a single environment." +
                                                ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                                                " to a compatible version."
                                          : "Cannot backwards-migrate IR because this IR contains a multiple URls for a single environment."
                                  );
                              },
                              _unknown: () => {
                                  throw new Error("Unknown Environments: " + v6.environments?.environments.type);
                              }
                          }
                      )
                    : []
        };
    }
};
