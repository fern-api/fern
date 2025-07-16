import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";
import { ErrorResolverImpl } from "./ErrorResolver";
import { TypeReferenceResolverImpl } from "./TypeReferenceResolver";
import { convertAuth } from "./convertAuth";
import { convertEnvironment } from "./convertEnvironment";
import { convertErrorDeclaration } from "./convertErrorDeclaration";
import { convertHeader } from "./convertHeader";
import { convertNameAndWireValueToV1, convertNameAndWireValueToV2, convertNameToV2 } from "./convertName";
import { convertService } from "./convertService";
import { convertTypeDeclaration } from "./convertTypeDeclaration";

export const V5_TO_V4_MIGRATION: IrMigration<
    IrVersions.V5.ir.IntermediateRepresentation,
    IrVersions.V4.ir.IntermediateRepresentation
> = {
    laterVersion: "v5",
    earlierVersion: "v4",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.0.257-2-g46fe4ff",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.0.264",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "0.0.33-9-gf683b5e",
        [GeneratorName.PYTHON_PYDANTIC]: "0.0.33-9-gf683b5e",
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
    migrateBackwards: (v5): IrVersions.V4.ir.IntermediateRepresentation => {
        const typeReferenceResolver = new TypeReferenceResolverImpl(v5);
        const errorResolver = new ErrorResolverImpl(v5);
        return {
            apiName: v5.apiName.originalName,
            apiDisplayName: v5.apiDisplayName,
            apiDocs: v5.apiDocs,
            auth: convertAuth(v5.auth),
            headers: v5.headers.map((header) => convertHeader(header)),
            types: v5.types.map((typeDeclaration) => convertTypeDeclaration(typeDeclaration)),
            services: {
                http: v5.services.map((service) => convertService({ service, errorResolver })),
                websocket: []
            },
            errors: v5.errors.map((error) =>
                convertErrorDeclaration({
                    errorDeclaration: error,
                    errorDiscriminationStrategy: v5.errorDiscriminationStrategy,
                    typeReferenceResolver
                })
            ),
            constants: {
                errorDiscriminant: "_error",
                errorInstanceIdKey: "_errorInstanceId",
                unknownErrorDiscriminantValue: "_unknown"
            },
            constantsV2: {
                errors: {
                    errorInstanceIdKey: convertNameAndWireValueToV1(v5.constants.errorInstanceIdKey),
                    errorDiscriminant: {
                        originalValue: "error",
                        camelCase: "error",
                        snakeCase: "error",
                        pascalCase: "Error",
                        screamingSnakeCase: "ERROR",
                        wireValue: "error"
                    },
                    errorContentKey: {
                        originalValue: "content",
                        camelCase: "content",
                        snakeCase: "content",
                        pascalCase: "Content",
                        screamingSnakeCase: "CONTENT",
                        wireValue: "content"
                    }
                },
                errorsV2: {
                    errorInstanceIdKey: convertNameAndWireValueToV2(v5.constants.errorInstanceIdKey),
                    errorDiscriminant: {
                        name: {
                            unsafeName: {
                                originalValue: "error",
                                camelCase: "error",
                                snakeCase: "error",
                                pascalCase: "Error",
                                screamingSnakeCase: "ERROR"
                            },
                            safeName: {
                                originalValue: "error",
                                camelCase: "error",
                                snakeCase: "error",
                                pascalCase: "Error",
                                screamingSnakeCase: "ERROR"
                            }
                        },
                        wireValue: "error"
                    },
                    errorContentKey: {
                        name: {
                            unsafeName: {
                                originalValue: "content",
                                camelCase: "content",
                                snakeCase: "content",
                                pascalCase: "Content",
                                screamingSnakeCase: "CONTENT"
                            },
                            safeName: {
                                originalValue: "content",
                                camelCase: "content",
                                snakeCase: "content",
                                pascalCase: "Content",
                                screamingSnakeCase: "CONTENT"
                            }
                        },
                        wireValue: "content"
                    }
                }
            },
            defaultEnvironment: v5.defaultEnvironment,
            environments: v5.environments.map((environment) => convertEnvironment(environment)),
            errorDiscriminant:
                v5.errorDiscriminationStrategy.type === "property"
                    ? convertNameToV2(v5.errorDiscriminationStrategy.discriminant.name)
                    : undefined,
            errorDiscriminationStrategy:
                IrVersions.V5.ir.ErrorDiscriminationStrategy._visit<IrVersions.V4.ir.ErrorDiscriminationStrategy>(
                    v5.errorDiscriminationStrategy,
                    {
                        statusCode: IrVersions.V4.ir.ErrorDiscriminationStrategy.statusCode,
                        property: (property) =>
                            IrVersions.V4.ir.ErrorDiscriminationStrategy.property({
                                discriminant: convertNameAndWireValueToV2(property.discriminant),
                                contentProperty: convertNameAndWireValueToV2(property.contentProperty)
                            }),
                        _unknown: () => {
                            throw new Error(
                                "Unknown ErrorDiscriminationStrategy: " + v5.errorDiscriminationStrategy.type
                            );
                        }
                    }
                ),
            sdkConfig: v5.sdkConfig
        };
    }
};
