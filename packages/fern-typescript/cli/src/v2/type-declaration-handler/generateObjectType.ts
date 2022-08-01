import { ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-model";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { File } from "../client/types";

export function generateObjectType({
    typeName,
    docs,
    file,
    shape,
}: {
    file: File;
    docs: string | null | undefined;
    typeName: string;
    shape: ObjectTypeDeclaration;
}): void {
    const node = file.sourceFile.addInterface({
        name: typeName,
        extends: shape.extends
            .map((typeName) => file.getReferenceToType(TypeReference.named(typeName)))
            .map(getTextOfTsNode),
        properties: shape.properties.map((field) => {
            const property = {
                name: field.key,
                type: getTextOfTsNode(file.getReferenceToType(field.valueType)),
                docs: field.docs != null ? [{ description: field.docs }] : undefined,
            };

            return property;
        }),
        isExported: true,
    });

    maybeAddDocs(node, docs);
}
