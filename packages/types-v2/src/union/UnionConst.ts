import { FernWriters, getTextOfTsNode, ObjectWriter } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";
import { AbstractVisitHelper } from "../visit-helper/AbstractVisitHelper";
import { AbstractUnionDeclaration } from "./AbstractUnionDeclaration";
import { AbstractParsedSingleUnionType } from "./parsed-single-union-type/AbstractParsedSingleUnionType";
import { UnionModule } from "./UnionModule";

export class UnionConst extends AbstractUnionDeclaration {
    public writeToFile(file: SdkFile, unionModule: UnionModule): void {
        if (this.parsedSingleUnionTypes.length === 0) {
            return;
        }

        const writer = FernWriters.object.writer({ asConst: true });

        this.addBuilderProperties(file, unionModule, writer);
        this.addVisitProperty(file, writer);

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
                value: getTextOfTsNode(
                    singleUnionType.getBuilder(file, {
                        referenceToBuiltType: unionModule.getReferenceToSingleUnionType(singleUnionType, file),
                        getReferenceToUnion: this.getReferenceToUnion,
                        unionModule,
                    })
                ),
            });
            writer.addNewLine();
        }
    }

    private addVisitProperty(file: SdkFile, writer: ObjectWriter) {
        const referenceToUnion = this.getReferenceToUnion(file);
        writer.addProperty({
            key: UnionModule.VISIT_UTIL_PROPERTY_NAME,
            value: getTextOfTsNode(
                ts.factory.createArrowFunction(
                    undefined,
                    [
                        ts.factory.createTypeParameterDeclaration(
                            undefined,
                            ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_RETURN_TYPE)
                        ),
                    ],
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_INVOCATION_PARAMETER_NAME),
                            undefined,
                            referenceToUnion.typeNode,
                            undefined
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_PARAMETER_NAME),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createQualifiedName(
                                    referenceToUnion.entityName,
                                    ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_INTERFACE_NAME)
                                ),
                                [
                                    ts.factory.createTypeReferenceNode(
                                        ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_RETURN_TYPE),
                                        undefined
                                    ),
                                ]
                            ),
                            undefined
                        ),
                    ],
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_RETURN_TYPE),
                        undefined
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(
                        [
                            ts.factory.createSwitchStatement(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_INVOCATION_PARAMETER_NAME),
                                    ts.factory.createIdentifier(
                                        AbstractParsedSingleUnionType.getDiscriminantKey(this.discriminant)
                                    )
                                ),
                                ts.factory.createCaseBlock([
                                    ...this.parsedSingleUnionTypes.map((parsedSingleUnionType) =>
                                        ts.factory.createCaseClause(
                                            ts.factory.createStringLiteral(
                                                parsedSingleUnionType.getDiscriminantValue()
                                            ),
                                            [
                                                ts.factory.createReturnStatement(
                                                    parsedSingleUnionType.invokeVisitMethod({
                                                        localReferenceToUnionValue: ts.factory.createIdentifier(
                                                            AbstractVisitHelper.VISITOR_INVOCATION_PARAMETER_NAME
                                                        ),
                                                        localReferenceToVisitor: ts.factory.createIdentifier(
                                                            AbstractVisitHelper.VISITOR_PARAMETER_NAME
                                                        ),
                                                    })
                                                ),
                                            ]
                                        )
                                    ),
                                    ts.factory.createDefaultClause([
                                        ts.factory.createReturnStatement(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier(
                                                        AbstractVisitHelper.VISITOR_PARAMETER_NAME
                                                    ),
                                                    ts.factory.createIdentifier(AbstractVisitHelper.UNKNOWN_VISITOR_KEY)
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createAsExpression(
                                                        ts.factory.createIdentifier(
                                                            AbstractVisitHelper.VISITOR_PARAMETER_NAME
                                                        ),
                                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                                    ),
                                                ]
                                            )
                                        ),
                                    ]),
                                ])
                            ),
                        ],
                        true
                    )
                )
            ),
        });
    }
}
