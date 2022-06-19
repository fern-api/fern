import { ObjectTypeDefinition } from "@fern-api/api";
import {
    getNamedTypeReference,
    getTextOfTsNode,
    getTypeReference,
    maybeAddDocs,
    SourceFileManager,
} from "@fern-typescript/commons";
import { Directory } from "ts-morph";

export function generateObjectType({
    typeName,
    docs,
    file,
    shape,
    modelDirectory,
}: {
    file: SourceFileManager;
    docs: string | null | undefined;
    typeName: string;
    shape: ObjectTypeDefinition;
    modelDirectory: Directory;
}): void {
    const node = file.file.addInterface({
        name: typeName,
        extends: shape.extends
            .map((typeName) => {
                const reference = getNamedTypeReference({
                    typeName,
                    referencedIn: file,
                    baseDirectory: modelDirectory,
                    baseDirectoryType: "model",
                });

                return reference;
            })
            .map(getTextOfTsNode),
        properties: shape.properties.map((field) => {
            const property = {
                name: field.key,
                type: getTextOfTsNode(
                    getTypeReference({
                        reference: field.valueType,
                        referencedIn: file,
                        baseDirectory: modelDirectory,
                        baseDirectoryType: "model",
                    })
                ),
                docs: field.docs != null ? [{ description: field.docs }] : undefined,
            };

            return property;
        }),
        isExported: true,
    });
    maybeAddDocs(node, docs);
}
