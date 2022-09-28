import { FernWriters, getTextOfTsNode, ObjectWriter } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { VariableDeclarationKind } from "ts-morph";
import { AbstractUnionFileDeclaration } from "./AbstractUnionFileDeclaration";
import { UnionModule } from "./UnionModule";

export class UnionConst extends AbstractUnionFileDeclaration {
    public writeToFile(file: SdkFile, unionModule: UnionModule): void {
        const writer = FernWriters.object.writer({ asConst: true });

        this.addBuilderProperties(file, unionModule, writer);

        file.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.getConstName(),
                    initializer: writer.toFunction(),
                },
            ],
            isExported: true,
        });
    }

    private getConstName(): string {
        return this.typeName;
    }

    private addBuilderProperties(file: SdkFile, unionModule: UnionModule, writer: ObjectWriter) {
        for (const singleUnionType of this.parsedSingleUnionTypes) {
            writer.addProperty({
                key: singleUnionType.getBuilderName(),
                value: getTextOfTsNode(singleUnionType.getBuilder(file, unionModule)),
            });
            writer.addNewLine();
        }
    }
}
