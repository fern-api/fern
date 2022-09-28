import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractUnionFileDeclaration } from "./AbstractUnionFileDeclaration";
import { AbstractParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";
import { UnionModule } from "./UnionModule";
import { UnionVisitHelper } from "./UnionVisitHelper";

export class UnionSchema extends AbstractUnionFileDeclaration {
    public toSchema(file: SdkFile): Zurg.Schema {
        const rawValueParameterName = "value";
        const parsedValueParameterName = "value";

        const transformCaseStatements = [
            ...this.parsedSingleUnionTypes.map(
                (singleUnionType) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(singleUnionType.getDiscriminantValue()),
                        [
                            ts.factory.createBlock([
                                this.getTransformReturnStatement({
                                    rawValueParameterName,
                                    shouldCastRawAsAny: false,
                                    visitMethod: singleUnionType.getVisitMethod({
                                        referenceToUnionValue: ts.factory.createIdentifier(rawValueParameterName),
                                    }),
                                }),
                            ]),
                        ]
                    ),
                ts.factory.createDefaultClause([
                    ts.factory.createBlock([
                        this.getTransformReturnStatement({
                            rawValueParameterName,
                            shouldCastRawAsAny: true,
                            visitMethod: UnionVisitHelper.getVisitMethod({
                                visitorKey: UnionVisitHelper.UNKNOWN_VISITOR_KEY,
                                visitorArguments: [ts.factory.createIdentifier(rawValueParameterName)],
                            }),
                        }),
                    ]),
                ])
            ),
        ];

        return file.coreUtilities.zurg
            .union({
                rawDiscriminant: this.union.discriminantV2.wireValue,
                parsedDiscriminant: AbstractParsedSingleUnionType.getDiscriminantKey(this.union),
                singleUnionTypes: this.parsedSingleUnionTypes.map((singleUnionType) => singleUnionType.getSchema(file)),
            })
            .transform({
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
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(rawValueParameterName),
                                    AbstractParsedSingleUnionType.getDiscriminantKey(this.union)
                                ),
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
                    ts.factory.createAsExpression(
                        ts.factory.createIdentifier(parsedValueParameterName),
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Exclude"), [
                            ts.factory.createTypeQueryNode(
                                ts.factory.createIdentifier(parsedValueParameterName),
                                undefined
                            ),
                            ts.factory.createTypeLiteralNode([
                                ts.factory.createPropertySignature(
                                    undefined,
                                    ts.factory.createIdentifier(
                                        AbstractParsedSingleUnionType.getDiscriminantKey(this.union)
                                    ),
                                    undefined,
                                    UnionModule.UNKNOWN_DISCRIMINANT_TYPE
                                ),
                            ]),
                        ])
                    )
                ),
            });
    }

    private getTransformReturnStatement({
        rawValueParameterName,
        shouldCastRawAsAny,
        visitMethod,
    }: {
        rawValueParameterName: string;
        shouldCastRawAsAny: boolean;
        visitMethod: ts.ArrowFunction;
    }): ts.ReturnStatement {
        return ts.factory.createReturnStatement(
            ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createSpreadAssignment(
                        shouldCastRawAsAny
                            ? ts.factory.createParenthesizedExpression(
                                  ts.factory.createAsExpression(
                                      ts.factory.createIdentifier(rawValueParameterName),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                  )
                              )
                            : ts.factory.createIdentifier(rawValueParameterName)
                    ),
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier(UnionModule.VISIT_UTIL_PROPERTY_NAME),
                        visitMethod
                    ),
                ],
                true
            )
        );
    }
}
