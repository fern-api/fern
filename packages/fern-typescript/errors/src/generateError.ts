import { ErrorDefinition } from "@fern-api/api";
import {
    getFilePathForError,
    getOrCreateSourceFile,
    getTextOfTsNode,
    getTypeReference,
} from "@fern-typescript/commons";
import { Directory } from "ts-morph";

export function generateError({
    error,
    errorsDirectory,
    modelDirectory,
}: {
    error: ErrorDefinition;
    errorsDirectory: Directory;
    modelDirectory: Directory;
}): void {
    const filepath = getFilePathForError({
        errorsDirectory,
        error: error.name,
    });

    const file = getOrCreateSourceFile(errorsDirectory, filepath);

    file.addInterface({
        name: error.name.name,
        isExported: true,
        properties: error.properties.map((property) => ({
            name: property.name,
            docs: property.docs != null ? [property.docs] : undefined,
            type: getTextOfTsNode(
                getTypeReference({
                    reference: property.type,
                    referencedIn: file,
                    modelDirectory,
                })
            ),
        })),
    });
}
