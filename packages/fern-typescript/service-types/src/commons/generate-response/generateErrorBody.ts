import { FailedResponse, ModelReference, PrimitiveType, ResponseError, TypeReference } from "@fern-api/api";
import {
    DependencyManager,
    ErrorResolver,
    generateUuidCall,
    getModelTypeReference,
    resolveType,
    TypeResolver,
} from "@fern-typescript/commons";
import {
    FORCE_USE_MODEL_NAMESPACE_IMPORT_FOR_UNION_TYPES,
    generateUnionType,
    isTypeExtendable,
    ResolvedSingleUnionValueType,
} from "@fern-typescript/types";
import { Directory, SourceFile } from "ts-morph";
import { ServiceTypeMetadata } from "../service-type-reference/types";

export function generateErrorBody({
    failedResponse,
    errorBodyFile,
    errorBodyMetadata,
    modelDirectory,
    typeResolver,
    errorResolver,
    dependencyManager,
}: {
    failedResponse: FailedResponse;
    errorBodyFile: SourceFile;
    errorBodyMetadata: ServiceTypeMetadata;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    dependencyManager: DependencyManager;
}): void {
    generateUnionType({
        file: errorBodyFile,
        typeName: errorBodyMetadata.typeName,
        docs: failedResponse.docs,
        discriminant: failedResponse.discriminant,
        resolvedTypes: failedResponse.errors.map((error) => ({
            docs: error.docs,
            discriminantValue: error.discriminantValue,
            valueType: getValueType({ error, file: errorBodyFile, modelDirectory, typeResolver, errorResolver }),
        })),
        additionalPropertiesForEveryType: [
            {
                key: failedResponse.errorProperties.errorInstanceId,
                valueType: TypeReference.primitive(PrimitiveType.String),
                generateValueCreator: ({ file }) => {
                    return generateUuidCall({ file, dependencyManager });
                },
            },
        ],
        modelDirectory,
    });
}

function getValueType({
    error,
    file,
    modelDirectory,
    typeResolver,
    errorResolver,
}: {
    error: ResponseError;
    file: SourceFile;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
}): ResolvedSingleUnionValueType | undefined {
    const errorDefinition = errorResolver.resolveError(error.error);

    const resolvedType = resolveType(errorDefinition.type, (typeName) => typeResolver.resolveTypeName(typeName));

    if (resolvedType._type === "void") {
        return undefined;
    }

    return {
        isExtendable: isTypeExtendable(resolvedType),
        type: getModelTypeReference({
            reference: ModelReference.error(error.error),
            referencedIn: file,
            modelDirectory,
            forceUseNamespaceImport: FORCE_USE_MODEL_NAMESPACE_IMPORT_FOR_UNION_TYPES,
        }),
    };
}
