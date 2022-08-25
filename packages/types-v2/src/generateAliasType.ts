import { AliasTypeDeclaration } from "@fern-fern/ir-model";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";

export function generateAliasType({
    file,
    typeName,
    docs,
    shape,
}: {
    file: File;
    typeName: string;
    docs: string | null | undefined;
    shape: AliasTypeDeclaration;
}): void {
    const typeAlias = file.sourceFile.addTypeAlias({
        name: typeName,
        type: getTextOfTsNode(file.getReferenceToType(shape.aliasOf).typeNode),
        isExported: true,
    });
    maybeAddDocs(typeAlias, docs);
}
