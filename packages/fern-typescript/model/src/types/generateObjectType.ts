import { ObjectTypeDefinition } from "@fern-api/api";
import {
    generateNamedTypeReference,
    generateTypeReference,
    getTextOfTsNode,
    maybeAddDocs,
} from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";

export function generateObjectType({
    typeName,
    docs,
    file,
    shape,
    modelDirectory,
}: {
    file: SourceFile;
    docs: string | null | undefined;
    typeName: string;
    shape: ObjectTypeDefinition;
    modelDirectory: Directory;
}): void {
    const node = file.addInterface({
        name: typeName,
        extends: shape.extends
            .map((typeName) => {
                const reference = generateNamedTypeReference({
                    typeName,
                    referencedIn: file,
                    baseDirectory: modelDirectory,
                    baseDirectoryType: "model",
                    factory: ts.factory,
                });

                return reference;
            })
            .map(getTextOfTsNode),
        properties: shape.properties.map((field) => {
            const property = {
                name: field.key,
                type: getTextOfTsNode(
                    generateTypeReference({
                        reference: field.valueType,
                        referencedIn: file,
                        modelDirectory,
                        factory: ts.factory,
                        SyntaxKind: ts.SyntaxKind,
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
