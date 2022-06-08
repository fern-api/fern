import { ErrorDefinition } from "@fern-api/api";
import { getFilePathForError, getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/model";
import { Directory } from "ts-morph";

export function generateError({
    error,
    errorsDirectory,
    modelDirectory,
    typeResolver,
}: {
    error: ErrorDefinition;
    errorsDirectory: Directory;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
}): void {
    const filepath = getFilePathForError({
        errorsDirectory,
        error: error.name,
    });

    const file = getOrCreateSourceFile(errorsDirectory, filepath);

    generateType({
        type: error.type,
        typeName: error.name.name,
        docs: error.docs,
        typeResolver,
        modelDirectory,
        file,
    });
}
