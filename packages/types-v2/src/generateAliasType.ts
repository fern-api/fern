import { AliasTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";

export function generateAliasType({
    file,
    typeName,
    docs,
    shape,
}: {
    file: SdkFile;
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
