import { ObjectTypeDefinition, TypeDefinition } from "@fern/ir-generation";
import { SourceFile } from "ts-morph";
import { generateTypeNameReference, generateTypeReference } from "../utils/generateTypeReference";
import { getTextOfTsNode } from "../utils/getTextOfTsNode";
import { maybeAddDocs } from "../utils/maybeAddDocs";

export function generateObjectType({
    file,
    typeDefinition,
    shape,
}: {
    file: SourceFile;
    typeDefinition: TypeDefinition;
    shape: ObjectTypeDefinition;
}): void {
    const node = file.addInterface({
        name: typeDefinition.name.name,
        extends: shape.extends.map((typeName) => generateTypeNameReference(typeName, file)).map(getTextOfTsNode),
        properties: shape.fields.map((field) => ({
            name: field.key,
            type: getTextOfTsNode(generateTypeReference(field.valueType, file)),
            docs: field.docs != null ? [{ description: field.docs }] : undefined,
        })),
        isExported: true,
    });
    maybeAddDocs(node, typeDefinition.docs);
}
