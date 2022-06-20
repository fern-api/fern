import { ErrorDefinition } from "@fern-api/api";
import { getFilePathForNamedType, getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateType } from "../types/generateType";

export function generateError({
    error,
    modelDirectory,
    typeResolver,
}: {
    error: ErrorDefinition;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
}): void {
    const filepath = getFilePathForNamedType({
        typeName: error.name,
        typeCategory: "error",
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
