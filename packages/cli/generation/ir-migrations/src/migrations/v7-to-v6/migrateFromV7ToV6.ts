import { upperFirst } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V7_TO_V6_MIGRATION: IrMigration<
    IrVersions.V7.ir.IntermediateRepresentation,
    IrVersions.V6.ir.IntermediateRepresentation
> = {
    laterVersion: "v7",
    earlierVersion: "v6",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.268",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.268",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
    migrateBackwards: (v7): IrVersions.V6.ir.IntermediateRepresentation => {
        return {
            ...v7,
            services: v7.services.map((service) => {
                const lastFernFilepathPart = service.name.fernFilepath[service.name.fernFilepath.length - 1];

                const originalName =
                    lastFernFilepathPart != null ? `${lastFernFilepathPart.pascalCase.safeName}Service` : "Service";
                const camelCase =
                    lastFernFilepathPart != null ? `${lastFernFilepathPart.camelCase.unsafeName}Service` : "Service";
                const snakeCase =
                    lastFernFilepathPart != null ? `${lastFernFilepathPart.snakeCase.unsafeName}_service` : "service";
                const screamingSnakeCase = snakeCase.toUpperCase();
                const pascalCase = upperFirst(camelCase);

                return {
                    ...service,
                    name: {
                        name: {
                            originalName,
                            camelCase: {
                                safeName: camelCase,
                                unsafeName: camelCase
                            },
                            snakeCase: {
                                safeName: snakeCase,
                                unsafeName: snakeCase
                            },
                            screamingSnakeCase: {
                                safeName: screamingSnakeCase,
                                unsafeName: screamingSnakeCase
                            },
                            pascalCase: {
                                safeName: pascalCase,
                                unsafeName: pascalCase
                            }
                        },
                        fernFilepath: service.name.fernFilepath
                    }
                };
            })
        };
    }
};
