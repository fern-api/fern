import { ErrorDefinition } from "@fern-api/api";
import { generateTypeReference, getFilePathForError, getTextOfTsNode, withSourceFile } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";

// TODO this should live in IR
const DISCRIMINANT = "_type";

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

    withSourceFile({ directory: errorsDirectory, filepath }, (file) => {
        file.addInterface({
            name: error.name.name,
            isExported: true,
            properties: [
                {
                    name: DISCRIMINANT,
                    type: getTextOfTsNode(ts.factory.createStringLiteral(error.name.name)),
                },
                ...error.properties.map((property) => ({
                    name: property.name,
                    docs: property.docs != null ? [property.docs] : undefined,
                    type: getTextOfTsNode(
                        generateTypeReference({ reference: property.type, referencedIn: file, modelDirectory })
                    ),
                })),
            ],
        });
    });
}
