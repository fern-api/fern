import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";
import { convertName, convertNameAndWireValue } from "./converters/commons";
import { convertHttpHeaders, convertServices } from "./converters/http";
import { convertAuth } from "./converters/auth";
import { convertTypeReference, convertTypes } from "./converters/types";
import { convertWebsocketChannels } from "./converters/websockets";

export const V61_TO_V60_MIGRATION: IrMigration<
    IrVersions.V61.ir.IntermediateRepresentation,
    IrVersions.V60.ir.IntermediateRepresentation
> = {
    laterVersion: "v61",
    earlierVersion: "v60",
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
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V60.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (
        v61: IrVersions.V61.IntermediateRepresentation
    ): IrVersions.V60.ir.IntermediateRepresentation => {
        return {
            ...v61,
            apiVersion: v61.apiVersion != null ? convertApiVersionScheme(v61.apiVersion) : undefined, // done
            apiName: convertName(v61.apiName),// done
            auth: convertAuth(v61.auth),// done
            headers: convertHttpHeaders(v61.headers),// done
            idempotencyHeaders: convertHttpHeaders(v61.idempotencyHeaders), // done
            types: convertTypes(v61.types),
            services: convertServices(v61.services),
            webhookGroups: convertWebhookGroups(v61.webhookGroups),
            websocketChannels: v61.websocketChannels != null ? convertWebsocketChannels(v61.websocketChannels) : undefined,
            errors: convertErrors(v61.errors),
            subpackages: convertSubpackages(v61.subpackages),
            rootPackage: convertRootPackage(v61.rootPackage),
            constants: convertConstants(v61.constants),
            environments: v61.environments != null ? convertEnvironments(v61.environments) : undefined,
            pathParameters: convertPathParameters(v61.pathParameters),
            errorDiscriminationStrategy: convertErrorDiscriminationStrategy(v61.errorDiscriminationStrategy),
            variables: convertVariables(v61.variables),
            dynamic: v61.dynamic != null ? convertDynamic(v61.dynamic) : undefined,
        };
    }
};

function convertApiVersionScheme(apiVersion: IrVersions.V61.ApiVersionScheme): IrVersions.V60.ApiVersionScheme {
    return IrVersions.V60.ApiVersionScheme.header({
        header: {
            ...apiVersion.header,
            name: convertNameAndWireValue(apiVersion.header.name),
            valueType: convertTypeReference(apiVersion.header.valueType)
        },
        value: {
            ...apiVersion.value,
            values: apiVersion.value.values.map(enumValue => ({
                ...enumValue,
                name: convertNameAndWireValue(enumValue.name)
            })),
            default: apiVersion.value.default != null ? {
                ...apiVersion.value.default,
                name: convertNameAndWireValue(apiVersion.value.default.name)
            } : undefined
        }
    })
}

function convertErrors(errors: Record<IrVersions.V61.ErrorId, IrVersions.V61.ErrorDeclaration>): Record<IrVersions.V60.ErrorId, IrVersions.V60.ErrorDeclaration> {
    return Object.fromEntries(
        Object.entries(errors).map(([key, errorDeclaration]) => [
            key,
            convertErrorDeclaration(errorDeclaration)
        ])
    );
}

function convertErrorDeclaration(errorDeclaration: IrVersions.V61.ErrorDeclaration): IrVersions.V60.ErrorDeclaration {
    return {
        ...errorDeclaration,
        name: convertNameAndWireValue(errorDeclaration.name),
        type: errorDeclaration.type != null ? convertTypeReference(errorDeclaration.type) : undefined
    };
}

function convertHttpRequestBody(requestBody: IrVersions.V61.HttpRequestBody): IrVersions.V60.HttpRequestBody {
    switch (requestBody.type) {
        case "inlinedRequestBody":
            return {
                ...requestBody,
                name: convertName(requestBody.name),
                extends: requestBody.extends.map(convertDeclaredTypeName),
                properties: requestBody.properties.map(property => ({
                    ...property,
                    name: convertNameAndWireValue(property.name),
                    valueType: convertTypeReference(property.valueType)
                }))
            };
        case "reference":
            return {
                ...requestBody,
                requestBodyType: convertTypeReference(requestBody.requestBodyType)
            };
        case "fileUpload":
            return {
                ...requestBody,
                name: convertName(requestBody.name),
                properties: requestBody.properties.map(convertFileUploadRequestProperty)
            };
        case "bytes":
            return requestBody;
        default:
            return assertNever(requestBody);
    }
}

function convertFileUploadRequestProperty(property: IrVersions.V61.FileUploadRequestProperty): IrVersions.V60.FileUploadRequestProperty {
    switch (property.type) {
        case "file":
            return {
                ...property,
                key: convertNameAndWireValue(property.key),
                value: convertFileProperty(property.value)
            };
        case "bodyProperty":
            return {
                ...property,
                name: convertNameAndWireValue(property.name),
                valueType: convertTypeReference(property.valueType)
            };
        default:
            return assertNever(property);
    }
}

function convertFileProperty(fileProperty: IrVersions.V61.FileProperty): IrVersions.V60.FileProperty {
    switch (fileProperty.type) {
        case "file":
            return {
                ...fileProperty,
                key: convertNameAndWireValue(fileProperty.key)
            };
        case "fileArray":
            return {
                ...fileProperty,
                key: convertNameAndWireValue(fileProperty.key)
            };
        default:
            return assertNever(fileProperty);
    }
}

function convertResponseError(responseError: IrVersions.V61.ResponseError): IrVersions.V60.ResponseError {
    return {
        ...responseError,
        error: convertDeclaredErrorName(responseError.error)
    };
}

function convertDeclaredErrorName(errorName: IrVersions.V61.DeclaredErrorName): IrVersions.V60.DeclaredErrorName {
    return {
        ...errorName,
        fernFilepath: {
            ...errorName.fernFilepath,
            allParts: errorName.fernFilepath.allParts.map(convertName),
            packagePath: errorName.fernFilepath.packagePath.map(convertName),
            file: errorName.fernFilepath.file != null ? convertName(errorName.fernFilepath.file) : undefined
        }
    };
}

function convertWebhookGroups(webhookGroups: Record<IrVersions.V61.WebhookGroupId, IrVersions.V61.WebhookGroup>): Record<IrVersions.V60.WebhookGroupId, IrVersions.V60.WebhookGroup> {
    return Object.fromEntries(
        Object.entries(webhookGroups).map(([key, webhookGroup]) => [
            key,
            convertWebhookGroup(webhookGroup)
        ])
    );
}

function convertSubpackages(subpackages: Record<IrVersions.V61.SubpackageId, IrVersions.V61.Subpackage>): Record<IrVersions.V60.SubpackageId, IrVersions.V60.Subpackage> {
    return Object.fromEntries(
        Object.entries(subpackages).map(([key, subpackage]) => [
            key,
            convertSubpackage(subpackage)
        ])
    );
}

function convertSubpackage(subpackage: IrVersions.V61.Subpackage): IrVersions.V60.Subpackage {
    return {
        ...subpackage,
        name: convertName(subpackage.name),
        fernFilepath: {
            ...subpackage.fernFilepath,
            allParts: subpackage.fernFilepath.allParts.map(convertName),
            packagePath: subpackage.fernFilepath.packagePath.map(convertName),
            file: subpackage.fernFilepath.file != null ? convertName(subpackage.fernFilepath.file) : undefined
        }
    };
}

function convertRootPackage(rootPackage: IrVersions.V61.Package): IrVersions.V60.Package {
    return {
        ...rootPackage,
        name: convertName(rootPackage.name),
        fernFilepath: {
            ...rootPackage.fernFilepath,
            allParts: rootPackage.fernFilepath.allParts.map(convertName),
            packagePath: rootPackage.fernFilepath.packagePath.map(convertName),
            file: rootPackage.fernFilepath.file != null ? convertName(rootPackage.fernFilepath.file) : undefined
        }
    };
}

function convertConstants(constants: IrVersions.V61.Constants): IrVersions.V60.Constants {
    return {
        ...constants,
        errorInstanceIdKey: convertNameAndWireValue(constants.errorInstanceIdKey)
    };
}

function convertEnvironments(environments: IrVersions.V61.EnvironmentsConfig): IrVersions.V60.EnvironmentsConfig {
    switch (environments.type) {
        case "singleBaseUrl":
            return environments;
        case "multipleBaseUrls":
            return {
                ...environments,
                environments: environments.environments.map(environment => ({
                    ...environment,
                    name: convertNameAndWireValue(environment.name)
                }))
            };
        default:
            return assertNever(environments);
    }
}

function convertPathParameters(pathParameters: IrVersions.V61.PathParameter[]): IrVersions.V60.PathParameter[] {
    return pathParameters.map(pathParam => ({
        ...pathParam,
        name: convertName(pathParam.name),
        valueType: convertTypeReference(pathParam.valueType)
    }));
}

function convertErrorDiscriminationStrategy(errorDiscriminationStrategy: IrVersions.V61.ErrorDiscriminationStrategy): IrVersions.V60.ErrorDiscriminationStrategy {
    switch (errorDiscriminationStrategy.type) {
        case "statusCode":
            return errorDiscriminationStrategy;
        case "property":
            return {
                ...errorDiscriminationStrategy,
                discriminant: convertNameAndWireValue(errorDiscriminationStrategy.discriminant),
                contentProperty: convertNameAndWireValue(errorDiscriminationStrategy.contentProperty)
            };
        default:
            return assertNever(errorDiscriminationStrategy);
    }
}

function convertVariables(variables: IrVersions.V61.VariableDeclaration[]): IrVersions.V60.VariableDeclaration[] {
    return variables.map(variable => ({
        ...variable,
        name: convertName(variable.name),
        type: convertTypeReference(variable.type)
    }));
}

function convertDynamic(dynamic: IrVersions.V61.dynamic.DynamicIntermediateRepresentation): IrVersions.V60.dynamic.DynamicIntermediateRepresentation {
    return {
        ...dynamic,
        types: Object.fromEntries(
            Object.entries(dynamic.types).map(([key, namedType]) => [
                key,
                convertResolvedNamedType(namedType)
            ])
        )
    };
}

function convertResolvedNamedType(namedType: IrVersions.V61.ResolvedNamedType): IrVersions.V60.ResolvedNamedType {
    switch (namedType.type) {
        case "alias":
            return {
                ...namedType,
                aliasOf: convertTypeReference(namedType.aliasOf),
                resolvedType: convertResolvedTypeReference(namedType.resolvedType)
            };
        case "enum":
            return {
                ...namedType,
                values: namedType.values.map(enumValue => ({
                    ...enumValue,
                    name: convertNameAndWireValue(enumValue.name)
                })),
                default: namedType.default != null ? {
                    ...namedType.default,
                    name: convertNameAndWireValue(namedType.default.name)
                } : undefined
            };
        case "object":
            return {
                ...namedType,
                extends: namedType.extends.map(convertDeclaredTypeName),
                properties: namedType.properties.map(property => ({
                    ...property,
                    name: convertNameAndWireValue(property.name),
                    valueType: convertTypeReference(property.valueType)
                }))
            };
        case "union":
            return {
                ...namedType,
                discriminant: convertNameAndWireValue(namedType.discriminant),
                baseProperties: namedType.baseProperties.map(property => ({
                    ...property,
                    name: convertNameAndWireValue(property.name),
                    valueType: convertTypeReference(property.valueType)
                })),
                types: namedType.types.map(unionType => convertSingleUnionType(unionType))
            };
        case "undiscriminatedUnion":
            return {
                ...namedType,
                members: namedType.members.map(member => ({
                    ...member,
                    type: convertTypeReference(member.type)
                }))
            };
        default:
            return assertNever(namedType);
    }
}
function convertRequestProperty(requestProperty: IrVersions.V61.RequestProperty): IrVersions.V60.RequestProperty {
}

function convertResponseProperty(responseProperty: IrVersions.V61.ResponseProperty): IrVersions.V60.ResponseProperty {
}
function convertWebsocketChannels(websocketChannels: Record<string, IrVersions.V61.WebSocketChannel>): Record<string, IrVersions.V60.WebSocketChannel> | undefined {
    throw new Error("Function not implemented.");
}

