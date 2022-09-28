import { AliasTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { generateSchemaDeclarations } from "./generateSchemaDeclarations";

export function generateAliasType({
    typeFile,
    schemaFile,
    typeName,
    shape,
    typeDeclaration,
}: {
    typeFile: SdkFile;
    schemaFile: SdkFile;
    typeName: string;
    shape: AliasTypeDeclaration;
    typeDeclaration: TypeDeclaration;
}): void {
    const typeAlias = typeFile.sourceFile.addTypeAlias({
        name: typeName,
        type: getTextOfTsNode(typeFile.getReferenceToType(shape.aliasOf).typeNode),
        isExported: true,
    });
    maybeAddDocs(typeAlias, typeDeclaration.docs);

    generateSchemaDeclarations({
        schemaFile,
        schema: schemaFile.getSchemaOfTypeReference(shape.aliasOf),
        typeDeclaration,
        typeName,
        generateRawTypeDeclaration: (module, rawTypeName) => {
            module.addTypeAlias({
                name: rawTypeName,
                type: getTextOfTsNode(schemaFile.getReferenceToRawType(shape.aliasOf).typeNode),
            });
        },
    });
}
