import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { VariableDeclarationKind } from "ts-morph";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumInterface } from "./EnumInterface";

export class EnumConst extends AbstractEnumFileDeclaration {
    public writeToFile(file: SdkFile, enumInterface: EnumInterface): void {
        const writer = FernWriters.object.writer({ asConst: true });

        for (const enumValue of this.parsedEnumValues) {
            writer.addProperty({
                key: enumValue.getBuilderKey(),
                value: getTextOfTsNode(enumValue.getBuild(enumInterface)),
                docs: enumValue.getDocs(),
            });
        }

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

    private getConstName() {
        return this.typeName;
    }
}
