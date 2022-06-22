import { FailedResponse, PrimitiveType, ResponseError, TypeReference } from "@fern-api/api";
import { DependencyManager, generateUuidCall, ModelContext, ServiceTypeMetadata } from "@fern-typescript/commons";
import {
    generateUnionType,
    isTypeExtendable,
    ResolvedSingleUnionValueType,
    UNION_TYPE_MODEL_IMPORT_STRATEGY,
} from "@fern-typescript/types";
import { SourceFile } from "ts-morph";

export function generateErrorBody({
    failedResponse,
    errorBodyFile,
    errorBodyMetadata,
    modelContext,
    dependencyManager,
}: {
    failedResponse: FailedResponse;
    errorBodyFile: SourceFile;
    errorBodyMetadata: ServiceTypeMetadata;
    modelContext: ModelContext;
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
            valueType: getValueType({ error, file: errorBodyFile, modelContext }),
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
        modelContext,
    });
}

function getValueType({
    error,
    file,
    modelContext,
}: {
    error: ResponseError;
    file: SourceFile;
    modelContext: ModelContext;
}): ResolvedSingleUnionValueType | undefined {
    const errorDefinition = modelContext.resolveErrorName(error.error);
    const resolvedType = modelContext.resolveTypeDefinition(errorDefinition.type);

    if (resolvedType._type === "void") {
        return undefined;
    }

    return {
        isExtendable: isTypeExtendable(resolvedType),
        type: modelContext.getReferenceToError({
            errorName: error.error,
            referencedIn: file,
            importStrategy: UNION_TYPE_MODEL_IMPORT_STRATEGY,
        }),
    };
}
