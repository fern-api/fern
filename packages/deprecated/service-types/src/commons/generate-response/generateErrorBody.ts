import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { FernConstants } from "@fern-fern/ir-model/ir";
import { ResponseError, ResponseErrors } from "@fern-fern/ir-model/services/commons";
import { PrimitiveType, ShapeType, TypeReference } from "@fern-fern/ir-model/types";
import { DependencyManager, generateUuidCall } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import {
    generateUnionType,
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
                discriminantValue: modelContext.getErrorDeclarationFromName(error.error).discriminantValueV4,
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

    if (errorDeclaration.type._type === "alias" && errorDeclaration.type.resolvedType._type === "void") {
        return undefined;
    }

    return {
        isExtendable: isErrorExtendable(errorDeclaration),
        type: modelContext.getReferenceToError({
            errorName: error.error,
            referencedIn: file,
            importStrategy: UNION_TYPE_MODEL_IMPORT_STRATEGY,
        }),
    };
}

function isErrorExtendable(declaration: ErrorDeclaration): boolean {
    if (declaration.type._type === "object") {
        return true;
    }

    if (
        declaration.type._type === "alias" &&
        declaration.type.resolvedType._type === "named" &&
        declaration.type.resolvedType.shape === ShapeType.Object
    ) {
        return true;
    }

    return false;
}
