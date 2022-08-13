import { ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-model";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
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
    shape: ObjectTypeDeclaration;
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
                name: field.name.wireValue,
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
