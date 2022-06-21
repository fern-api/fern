import { ErrorDefinition, ModelReference } from "@fern-api/api";
import { getFilePathForModelReference, getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/types";
import { Directory } from "ts-morph";

export function generateError({
    error,
    modelDirectory,
    typeResolver,
}: {
    error: ErrorDefinition;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
}): void {
    const filepath = getFilePathForModelReference({
        reference: ModelReference.error(error.name),
        modelDirectory,
    });

    const file = getOrCreateSourceFile(modelDirectory, filepath);

    generateType({
        type: error.type,
        typeName: error.name.name,
        docs: error.docs,
        typeResolver,
        modelDirectory,
        file,
    });
}
