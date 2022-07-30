import { FernConstants, PrimitiveType, Type, TypeReference } from "@fern-fern/ir-model";
import { ResponseError, ResponseErrors } from "@fern-fern/ir-model/services";
import { DependencyManager, generateUuidCall } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import {
    generateUnionType,
    isTypeExtendable,
    ResolvedSingleUnionValueType,
    UNION_TYPE_MODEL_IMPORT_STRATEGY,
} from "@fern-typescript/types";
import { SourceFile } from "ts-morph";

export function generateErrorBody({
    responseErrors,
    errorBodyTypeName,
    errorBodyFile,
    modelContext,
    dependencyManager,
    fernConstants,
}: {
    responseErrors: ResponseErrors;
    errorBodyTypeName: string;
    errorBodyFile: SourceFile;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
}): void {
    generateUnionType({
        file: errorBodyFile,
        typeName: errorBodyTypeName,
        docs: undefined,
        discriminant: fernConstants.errorDiscriminant,
        resolvedTypes: [
            ...responseErrors.map((error) => ({
                docs: error.docs,
                discriminantValue: error.discriminantValue,
                valueType: getValueType({ error, file: errorBodyFile, modelContext }),
            })),
        ],
        additionalPropertiesForEveryType: [
            {
                key: fernConstants.errorInstanceIdKey,
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
    const errorDeclaration = modelContext.getErrorDeclarationFromName(error.error);
    const resolvedType = modelContext.resolveTypeDeclaration(Type.object(errorDeclaration.type));

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
