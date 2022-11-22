import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumInterface } from "./EnumInterface";
import { EnumModule } from "./EnumModule";
import { EnumVisitHelper } from "./EnumVisitHelper";
import { ParsedEnumValue } from "./ParsedEnumValue";

export class EnumConst extends AbstractEnumFileDeclaration {
    public static PARSE_UTIL_NAME = "_parse";

    public writeToFile({
        file,
        enumInterface,
        enumModule,
    }: {
        file: SdkFile;
        enumInterface: EnumInterface;
        enumModule: EnumModule;
    }): void {
        const writer = FernWriters.object.writer({ asConst: true });

        for (const enumValue of this.parsedEnumValues) {
            writer.addProperty({
                key: enumValue.getBuilderKey(),
                value: getTextOfTsNode(enumValue.getReferenceToBuiltObject()),
                docs: enumValue.getDocs(),
            });
        }

        writer.addProperty({
            key: EnumConst.PARSE_UTIL_NAME,
            value: getTextOfTsNode(this.generateParse({ enumModule, enumInterface })),
        });

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

    private generateParse({
        enumInterface,
        enumModule,
    }: {
        enumInterface: EnumInterface;
        enumModule: EnumModule;
    }): ts.ArrowFunction {
        const RAW_VALUE_PARAMETER_NAME = "value";

        const caseStatements = [
            ...this.parsedEnumValues.map((enumValue) =>
                ts.factory.createCaseClause(enumValue.getRawValue().expression, [
                    ts.factory.createBlock([ts.factory.createReturnStatement(enumValue.getReferenceToBuiltObject())]),
                ])
            ),
            ts.factory.createDefaultClause([
                ts.factory.createBlock([
                    ts.factory.createReturnStatement(
                        ParsedEnumValue.getBuiltObjectDeclaration({
                            enumValue: ts.factory.createAsExpression(
                                ts.factory.createIdentifier(RAW_VALUE_PARAMETER_NAME),
                                enumModule.getReferenceToRawValue()
                            ),
                            visitorKey: EnumVisitHelper.UNKNOWN_VISITOR_KEY,
                            visitorArguments: [ts.factory.createIdentifier(RAW_VALUE_PARAMETER_NAME)],
                        })
                    ),
                ]),
            ]),
        ];

        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    RAW_VALUE_PARAMETER_NAME,
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                ),
            ],
            ts.factory.createTypeReferenceNode(enumInterface.getInterfaceName()),
            undefined,
            ts.factory.createBlock(
                [
                    ts.factory.createSwitchStatement(
                        ts.factory.createIdentifier(RAW_VALUE_PARAMETER_NAME),
                        ts.factory.createCaseBlock(caseStatements)
                    ),
                ],
                true
            )
        );
    }
}
