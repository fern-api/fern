import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";
import { UnionModule } from "./UnionModule";
import { UnionVisitHelper } from "./UnionVisitHelper";

export declare namespace UnionSchema {
    export interface Init {
        parsedSingleUnionTypes: ParsedSingleUnionType[];
        discriminant: WireStringWithAllCasings;
    }
}

export class UnionSchema {
    private parsedSingleUnionTypes: ParsedSingleUnionType[];
    private discriminant: WireStringWithAllCasings;

    constructor({ parsedSingleUnionTypes, discriminant }: UnionSchema.Init) {
        this.parsedSingleUnionTypes = parsedSingleUnionTypes;
        this.discriminant = discriminant;
    }

    public toSchema(
        file: SdkFile,
        {
            referenceToParsedShape,
            shouldIncludeDefaultCaseInTransform,
        }: { referenceToParsedShape: Reference; shouldIncludeDefaultCaseInTransform: boolean }
    ): Zurg.Schema {
        const rawValueParameterName = "value";
        const parsedValueParameterName = "value";

        const transformCaseStatements: ts.CaseOrDefaultClause[] = this.parsedSingleUnionTypes.map((singleUnionType) =>
            ts.factory.createCaseClause(ts.factory.createStringLiteral(singleUnionType.getDiscriminantValue()), [
                ts.factory.createBlock([
                    ts.factory.createReturnStatement(
                        singleUnionType.invokeBuilder({
                            referenceToParsedUnionType: referenceToParsedShape.expression,
                            localReferenceToUnionValue: ts.factory.createIdentifier(rawValueParameterName),
                        })
                    ),
                ]),
            ])
        );

        if (shouldIncludeDefaultCaseInTransform) {
            transformCaseStatements.push(
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
            );
        }

        return file.coreUtilities.zurg
            .union({
                rawDiscriminant: this.discriminant.wireValue,
                parsedDiscriminant: AbstractParsedSingleUnionType.getDiscriminantKey(this.discriminant),
                singleUnionTypes: this.parsedSingleUnionTypes.map((singleUnionType) => singleUnionType.getSchema(file)),
            })
            .transform({
                newShape: referenceToParsedShape.typeNode,
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
                                    AbstractParsedSingleUnionType.getDiscriminantKey(this.discriminant)
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
                            ts.factory.createIdentifier(parsedValueParameterName)
                        ),
                    ],
                    undefined,
                    undefined,
                    ts.factory.createAsExpression(
                        ts.factory.createIdentifier(parsedValueParameterName),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
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
