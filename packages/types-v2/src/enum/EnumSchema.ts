import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractEnumFileDeclaration } from "./AbstractEnumFileDeclaration";
import { EnumInterface } from "./EnumInterface";
import { EnumModule } from "./EnumModule";
import { EnumVisitHelper } from "./EnumVisitHelper";
import { ParsedEnumValue } from "./ParsedEnumValue";

export class EnumSchema extends AbstractEnumFileDeclaration {
    public toSchema(file: SdkFile): Zurg.Schema {
        const rawValueParameterName = "value";
        const parsedValueParameterName = "value";

        const transformCaseStatements = [
            ...this.parsedEnumValues.map((enumValue) =>
                ts.factory.createCaseClause(enumValue.getRawValue().expression, [
                    ts.factory.createBlock([
                        ts.factory.createReturnStatement(
                            EnumModule.getReferenceToBuilder({
                                referenceToModule: file.getReferenceToNamedType(this.typeDeclaration.name).expression,
                                enumValue,
                            })
                        ),
                    ]),
                ])
            ),
            ts.factory.createDefaultClause([
                ts.factory.createBlock([
                    ts.factory.createReturnStatement(
                        ParsedEnumValue.getBuiltObjectDeclaration({
                            enumValue: ts.factory.createIdentifier(rawValueParameterName),
                            visitorKey: EnumVisitHelper.UNKNOWN_VISITOR_KEY,
                            visitorArguments: [ts.factory.createIdentifier(rawValueParameterName)],
                        })
                    ),
                ]),
            ]),
        ];

        return file.coreUtilities.zurg.string().transform({
            newShape: file.getReferenceToNamedType(this.typeDeclaration.name).typeNode,
            parse: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [ts.factory.createParameterDeclaration(undefined, undefined, undefined, rawValueParameterName)],
                undefined,
                undefined,
                ts.factory.createBlock(
                    [
                        ts.factory.createSwitchStatement(
                            ts.factory.createIdentifier(rawValueParameterName),
                            ts.factory.createCaseBlock(transformCaseStatements)
                        ),
                    ],
                    true
                )
            ),
            json: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ts.factory.createIdentifier(parsedValueParameterName),
                        undefined,
                        undefined
                    ),
                ],
                undefined,
                undefined,
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(parsedValueParameterName),
                    EnumInterface.VALUE_PROPERTY_NAME
                )
            ),
        });
    }
}
