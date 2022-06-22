import { ObjectTypeDefinition, TypeReference } from "@fern-api/api";
import { getTextOfTsNode, maybeAddDocs, ModelContext } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

export function generateObjectType({
    typeName,
    docs,
    file,
    shape,
    modelContext,
}: {
    file: SourceFile;
    docs: string | null | undefined;
    typeName: string;
    shape: ObjectTypeDefinition;
    modelContext: ModelContext;
}): void {
    const node = file.addInterface({
        name: typeName,
        extends: shape.extends
            .map((typeName) =>
                modelContext.getReferenceToType({
                    reference: TypeReference.named(typeName),
                    referencedIn: file,
                })
            )
            .map(getTextOfTsNode),
        properties: shape.properties.map((field) => {
            const property = {
                name: field.key,
                type: getTextOfTsNode(
                    modelContext.getReferenceToType({
                        reference: field.valueType,
                        referencedIn: file,
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
