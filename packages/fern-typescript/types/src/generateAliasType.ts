import { AliasTypeDeclaration } from "@fern-fern/ir-model";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import { SourceFile } from "ts-morph";

export const ALIAS_UTILS_OF_KEY = "of";

export function generateAliasType({
    file,
    typeName,
    docs,
    shape,
    modelContext,
}: {
    file: SourceFile;
    typeName: string;
    docs: string | null | undefined;
    shape: AliasTypeDeclaration;
    modelContext: ModelContext;
}): void {
    const typeAlias = file.addTypeAlias({
        name: typeName,
        type: getTextOfTsNode(
            modelContext.getReferenceToType({
                reference: shape.aliasOf,
                referencedIn: file,
            })
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, docs);
}
