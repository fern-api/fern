import { ObjectTypeDefinition, TypeDefinition } from "@fernapi/ir-generation";
import { Directory, SourceFile } from "ts-morph";
import { generateTypeNameReference, generateTypeReference } from "../utils/generateTypeReference";
import { getTextOfTsNode } from "../utils/getTextOfTsNode";
import { maybeAddDocs } from "../utils/maybeAddDocs";

export function generateObjectType({
    file,
    typeDefinition,
    shape,
    modelDirectory,
}: {
    file: SourceFile;
    typeDefinition: TypeDefinition;
    shape: ObjectTypeDefinition;
    modelDirectory: Directory;
}): void {
    const node = file.addInterface({
        name: typeDefinition.name.name,
        extends: shape.extends
            .map((typeName) => generateTypeNameReference({ typeName, from: file, modelDirectory }))
            .map(getTextOfTsNode),
        properties: shape.fields.map((field) => ({
            name: field.key,
            type: getTextOfTsNode(generateTypeReference({ reference: field.valueType, from: file, modelDirectory })),
            docs: field.docs != null ? [{ description: field.docs }] : undefined,
        })),
        isExported: true,
    });
    maybeAddDocs(node, typeDefinition.docs);
}
