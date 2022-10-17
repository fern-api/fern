import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "../single-union-type-generator/SingleUnionTypeGenerator";
import { UnionModule } from "../UnionModule";
import { UnionVisitHelper } from "../UnionVisitHelper";
import { ParsedSingleUnionType } from "./ParsedSingleUnionType";

export abstract class AbstractParsedSingleUnionType implements ParsedSingleUnionType {
    constructor(private readonly singleUnionType: SingleUnionTypeGenerator) {}

    public getInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.getDiscriminantValue())
            ),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForInterface(file, {
                isRaw: false,
            }),
            extends: this.singleUnionType.getExtendsForInterface(file, { isRaw: false }),
            discriminant: this.getDiscriminant(),
            isRaw: false,
        });
    }

    public getRawInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.getDiscriminantValue())
            ),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForInterface(file, {
                isRaw: true,
            }),
            extends: this.singleUnionType.getExtendsForInterface(file, { isRaw: true }),
            discriminant: this.getDiscriminant(),
            isRaw: true,
        });
    }

    public static createDiscriminatedInterface({
        typeName,
        discriminant,
        discriminantValue,
        nonDiscriminantProperties = [],
        extends: extends_ = [],
        isRaw,
    }: {
        typeName: string;
        discriminant: WireStringWithAllCasings;
        discriminantValue: ts.TypeNode;
        nonDiscriminantProperties?: OptionalKind<PropertySignatureStructure>[];
        extends?: ts.TypeNode[];
        isRaw: boolean;
    }): ParsedSingleUnionType.InterfaceDeclaration {
        return {
            name: typeName,
            extends: extends_,
            jsonProperties: [
                {
                    name: isRaw
                        ? discriminant.wireValue
                        : AbstractParsedSingleUnionType.getDiscriminantKey(discriminant),
                    type: getTextOfTsNode(discriminantValue),
                },
                ...nonDiscriminantProperties,
            ],
        };
    }

    public getBuilder(
        file: SdkFile,
        { referenceToBuiltType }: { referenceToBuiltType: ts.TypeNode }
    ): ts.ArrowFunction {
        const VALUE_WITHOUT_VISIT_VARIABLE_NAME = "valueWithoutVisit";
        const CASTED_VALUE_VARIABLE_NAME = "castedValue";
        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            this.singleUnionType.getParametersForBuilder(file),
            referenceToBuiltType,
            undefined,
            ts.factory.createBlock(
                [
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier(VALUE_WITHOUT_VISIT_VARIABLE_NAME),
                                    undefined,
                                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                                        referenceToBuiltType,
                                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("_visit")),
                                    ]),
                                    ts.factory.createObjectLiteralExpression(
                                        [
                                            ...this.singleUnionType.getNonDiscriminantPropertiesForBuilder(file),
                                            ts.factory.createPropertyAssignment(
                                                this.getDiscriminantKey(),
                                                ts.factory.createStringLiteral(this.getDiscriminantValue())
                                            ),
                                        ],
                                        true
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("Object"),
                                ts.factory.createIdentifier("defineProperty")
                            ),
                            undefined,
                            [
                                ts.factory.createIdentifier(VALUE_WITHOUT_VISIT_VARIABLE_NAME),
                                ts.factory.createStringLiteral(UnionModule.VISIT_UTIL_PROPERTY_NAME),
                                ts.factory.createObjectLiteralExpression(
                                    [
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier("enumerable"),
                                            ts.factory.createFalse()
                                        ),
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier("writable"),
                                            ts.factory.createTrue()
                                        ),
                                    ],
                                    true
                                ),
                            ]
                        )
                    ),
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    CASTED_VALUE_VARIABLE_NAME,
                                    undefined,
                                    undefined,
                                    ts.factory.createAsExpression(
                                        ts.factory.createIdentifier(VALUE_WITHOUT_VISIT_VARIABLE_NAME),
                                        referenceToBuiltType
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    ts.factory.createExpressionStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(CASTED_VALUE_VARIABLE_NAME),
                                UnionModule.VISIT_UTIL_PROPERTY_NAME
                            ),
                            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                            UnionVisitHelper.getVisitMethod({
                                visitorKey: this.getVisitorKey(),
                                visitorArguments: this.singleUnionType.getVisitorArgumentsForBuilder(),
                            })
                        )
                    ),
                    ts.factory.createReturnStatement(ts.factory.createIdentifier(CASTED_VALUE_VARIABLE_NAME)),
                ],
                true
            )
        );
    }

    public invokeBuilder({
        referenceToParsedUnionType,
        localReferenceToUnionValue,
    }: {
        referenceToParsedUnionType: ts.Expression;
        localReferenceToUnionValue: ts.Expression;
    }): ts.CallExpression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referenceToParsedUnionType, this.getBuilderName()),
            undefined,
            this.singleUnionType.getBuilderArguments({ localReferenceToUnionValue })
        );
    }

    private getDiscriminantKey(): string {
        return AbstractParsedSingleUnionType.getDiscriminantKey(this.getDiscriminant());
    }

    public static getDiscriminantKey(discriminant: WireStringWithAllCasings): string {
        return discriminant.camelCase;
    }

    public getSchema(file: SdkFile): Zurg.union.SingleUnionType {
        return {
            discriminantValue: this.getDiscriminantValue(),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForSchema(file),
        };
    }

    public getVisitMethod({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.ArrowFunction {
        return UnionVisitHelper.getVisitMethod({
            visitorKey: this.getVisitorKey(),
            visitorArguments: this.singleUnionType.getVisitorArguments({ localReferenceToUnionValue }),
        });
    }

    public getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode {
        return UnionVisitHelper.getVisitorPropertySignature({
            parameterType: this.singleUnionType.getVisitMethodParameterType(file),
        });
    }

    public abstract getDocs(): string | null | undefined;
    public abstract getDiscriminantValue(): string;
    public abstract getInterfaceName(): string;
    public abstract getBuilderName(): string;
    public abstract getVisitorKey(): string;
    protected abstract getDiscriminant(): WireStringWithAllCasings;
}
