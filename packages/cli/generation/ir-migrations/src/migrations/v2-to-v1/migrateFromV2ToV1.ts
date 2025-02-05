import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V2_TO_V1_MIGRATION: IrMigration<
    IrVersions.V2.ir.IntermediateRepresentation,
    IrVersions.V1.ir.IntermediateRepresentation
> = {
    laterVersion: "v2",
    earlierVersion: "v1",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.246",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.264",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.STOPLIGHT]: GeneratorWasNotCreatedYet,
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
                        wireValue: error.discriminantValueV4.wireValue
                    },
                    discriminantValueV2: error.discriminantValueV2,
                    discriminantValueV3: error.discriminantValueV3,
                    discriminantValueV4: error.discriminantValueV4,
                    type: error.type,
                    typeV2: error.typeV2,
                    typeV3: error.typeV3,
                    http: error.http,
                    statusCode: error.statusCode
                })
            )
        };
    }
};
