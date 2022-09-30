import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface PropertyWithSchema {
    docs: string | undefined;
    key: {
        raw: string;
        parsed: string;
    };
    getValueType: (file: SdkFile) => {
        type: ts.TypeNode;
        isOptional: boolean;
    };
    getRawValueType: (file: SdkFile) => {
        type: ts.TypeNode;
        isOptional: boolean;
    };
    getSchema: (file: SdkFile) => Zurg.Schema;
}

export declare namespace generateObjectType {
    interface Args {
        typeFile: SdkFile;
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: ObjectTypeDeclaration;
        properties: PropertyWithSchema[];
    }
}

export function generateObjectType({
    typeName,
    typeDeclaration,
    typeFile,
    shape,
    properties,
}: generateObjectType.Args): void {
    const interfaceNode = typeFile.sourceFile.addInterface({
        name: typeName,
        properties: [
            ...properties.map((property) => {
                const value = property.getValueType(typeFile);
                const propertyNode: OptionalKind<PropertySignatureStructure> = {
                    name: property.key.parsed,
                    type: getTextOfTsNode(value.type),
                    hasQuestionToken: value.isOptional,
                    docs: property.docs != null ? [{ description: property.docs }] : undefined,
                };

                return propertyNode;
            }),
        ],
        isExported: true,
    });

    maybeAddDocs(interfaceNode, typeDeclaration.docs);

    for (const extension of shape.extends) {
        interfaceNode.addExtends(getTextOfTsNode(typeFile.getReferenceToNamedType(extension).typeNode));
    }
}
