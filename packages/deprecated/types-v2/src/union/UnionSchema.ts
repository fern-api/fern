import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractVisitHelper } from "../visit-helper/AbstractVisitHelper";
import { AbstractParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";
import { UnionModule } from "./UnionModule";

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
            unionModule,
        }: { referenceToParsedShape: Reference; shouldIncludeDefaultCaseInTransform: boolean; unionModule: UnionModule }
    ): Zurg.Schema {
        const rawValueParameterName = "value";
        const parsedValueParameterName = "value";

        const transformCaseStatements: ts.CaseOrDefaultClause[] = this.parsedSingleUnionTypes.map((singleUnionType) =>
            ts.factory.createCaseClause(ts.factory.createStringLiteral(singleUnionType.getDiscriminantValue()), [
                ts.factory.createReturnStatement(
                    singleUnionType.invokeBuilder({
                        referenceToParsedUnionType: referenceToParsedShape.getExpression(),
                        localReferenceToUnionValue: ts.factory.createIdentifier(rawValueParameterName),
                    })
                ),
            ])
        );

        if (shouldIncludeDefaultCaseInTransform) {
            const VISITOR_PARAMETER_NAME = "visitor";

            transformCaseStatements.push(
                ts.factory.createDefaultClause([
                    ts.factory.createReturnStatement(
                        file.coreUtilities.base.addNonEnumerableProperty(
                            ts.factory.createIdentifier(rawValueParameterName),
                            ts.factory.createStringLiteral(UnionModule.VISIT_UTIL_PROPERTY_NAME),
                            ts.factory.createFunctionExpression(
                                undefined,
                                undefined,
                                undefined,
                                [
                                    ts.factory.createTypeParameterDeclaration(
                                        undefined,
                                        AbstractVisitHelper.VISITOR_RETURN_TYPE
                                    ),
                                ],
                                [
                                    ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        undefined,
                                        "this",
                                        undefined,
                                        referenceToParsedShape.getTypeNode(),
                                        undefined
                                    ),
                                    ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        undefined,
                                        VISITOR_PARAMETER_NAME,
                                        undefined,
                                        ts.factory.createTypeReferenceNode(
                                            unionModule.getReferenceToVisitorInterface(file),
                                            [
                                                ts.factory.createTypeReferenceNode(
                                                    AbstractVisitHelper.VISITOR_RETURN_TYPE
                                                ),
                                            ]
                                        )
                                    ),
                                ],
                                undefined,
                                ts.factory.createBlock(
                                    [
                                        ts.factory.createReturnStatement(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier(
                                                        AbstractVisitHelper.VISITOR_PARAMETER_NAME
                                                    ),
                                                    ts.factory.createIdentifier(AbstractVisitHelper.UNKNOWN_VISITOR_KEY)
                                                ),
                                                undefined,
                                                [ts.factory.createIdentifier(parsedValueParameterName)]
                                            )
                                        ),
                                    ],
                                    true
                                )
                            )
                        )
                    ),
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
                newShape: referenceToParsedShape.getTypeNode(),
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
}
