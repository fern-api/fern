import { getWriterForMultiLineUnionType, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { AbstractUnionDeclaration } from "./AbstractUnionDeclaration";
import { UnionModule } from "./UnionModule";

export class UnionTypeAlias extends AbstractUnionDeclaration {
    public writeToFile(file: SdkFile, unionModule: UnionModule): void {
        const typeAlias = file.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getWriterForMultiLineUnionType([
                ...this.parsedSingleUnionTypes.map((singleUnionType) => ({
                    node: unionModule.getReferenceToSingleUnionType(singleUnionType),
                    docs: singleUnionType.getDocs(),
                })),
                {
                    node: unionModule.getReferenceToUnknownType(),
                    docs: undefined,
                },
            ]),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.docs);
    }
}
