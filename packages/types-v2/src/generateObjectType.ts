import { ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-model";
import { getPropertyKey, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { ts } from "ts-morph";

export function generateObjectType({
    typeName,
    docs,
    file,
    shape,
    additionalProperties = {},
}: {
    file: File;
    docs: string | null | undefined;
    typeName: string;
    shape: ObjectTypeDeclaration;
    additionalProperties?: Record<string, ts.TypeNode>;
}): void {
    const node = file.sourceFile.addInterface({
        name: typeName,
        extends: shape.extends
            .map((typeName) => file.getReferenceToType(TypeReference.named(typeName)))
            .map(getTextOfTsNode),
        properties: [
            ...Object.entries(additionalProperties).map(([name, value]) => ({
                name,
                type: getTextOfTsNode(value),
            })),
            ...shape.properties.map((field) => {
                const property = {
                    name: getPropertyKey(field.name.wireValue),
                    type: getTextOfTsNode(file.getReferenceToType(field.valueType)),
                    docs: field.docs != null ? [{ description: field.docs }] : undefined,
                };

                return property;
            }),
        ],
        isExported: true,
    });

    maybeAddDocs(node, docs);
}
