import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { GeneratedUnionImpl } from "../GeneratedUnionImpl";
import { SingleUnionTypeGenerator } from "../single-union-type-generator/SingleUnionTypeGenerator";
import { ParsedSingleUnionType } from "./ParsedSingleUnionType";

export abstract class AbstractParsedSingleUnionType<Context extends BaseContext>
    implements ParsedSingleUnionType<Context>
{
    private static VISITOR_PARAMETER_NAME = "visitor";

    constructor(private readonly singleUnionType: SingleUnionTypeGenerator<Context>) {}

    public getInterfaceDeclaration(context: Context): ParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.getDiscriminantValue())
            ),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForInterface(context),
            extends: this.singleUnionType.getExtendsForInterface(context),
            discriminant: this.getDiscriminant(),
        });
    }

    public static createDiscriminatedInterface({
        typeName,
        discriminant,
        discriminantValue,
        nonDiscriminantProperties = [],
        extends: extends_ = [],
    }: {
        typeName: string;
        discriminant: WireStringWithAllCasings;
        discriminantValue: ts.TypeNode;
        nonDiscriminantProperties?: OptionalKind<PropertySignatureStructure>[];
        extends?: ts.TypeNode[];
    }): ParsedSingleUnionType.InterfaceDeclaration {
        return {
            name: typeName,
            extends: extends_,
            jsonProperties: [
                {
                    name: AbstractParsedSingleUnionType.getDiscriminantKey(discriminant),
                    type: getTextOfTsNode(discriminantValue),
                },
                ...nonDiscriminantProperties,
            ],
        };
    }

    public getBuilder(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.ArrowFunction {
        const VALUE_WITHOUT_VISIT_VARIABLE_NAME = "valueWithoutVisit";
        const referenceToBuiltType = generatedUnion.getReferenceToSingleUnionType(this, context);

        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            this.singleUnionType.getParametersForBuilder(context),
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
                                        ts.factory.createLiteralTypeNode(
                                            ts.factory.createStringLiteral(GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME)
                                        ),
                                    ]),
                                    ts.factory.createObjectLiteralExpression(
                                        [
                                            ...this.singleUnionType.getNonDiscriminantPropertiesForBuilder(context),
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
                    ts.factory.createReturnStatement(
                        AbstractParsedSingleUnionType.addVisitMethodToValue({
                            context,
                            generatedUnion,
                            value: ts.factory.createIdentifier(VALUE_WITHOUT_VISIT_VARIABLE_NAME),
                            referenceToBuiltType,
                        })
                    ),
                ],
                true
            )
        );
    }

    public static addVisitMethodToValue<Context extends BaseContext>({
        context,
        generatedUnion,
        value,
        referenceToBuiltType,
    }: {
        context: Context;
        generatedUnion: GeneratedUnionImpl<Context>;
        value: ts.Expression;
        referenceToBuiltType: ts.TypeNode;
    }): ts.Expression {
        return context.coreUtilities.base.addNonEnumerableProperty(
            value,
            ts.factory.createStringLiteral(GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME),
            ts.factory.createFunctionExpression(
                undefined,
                undefined,
                undefined,
                [ts.factory.createTypeParameterDeclaration(undefined, GeneratedUnionImpl.VISITOR_RETURN_TYPE)],
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        "this",
                        undefined,
                        referenceToBuiltType,
                        undefined
                    ),
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        AbstractParsedSingleUnionType.VISITOR_PARAMETER_NAME,
                        undefined,
                        generatedUnion.getReferenceToVisitorInterface(context)
                    ),
                ],
                undefined,
                ts.factory.createBlock(
                    [
                        ts.factory.createReturnStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    generatedUnion.getReferenceToUnion(context).getExpression(),
                                    GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME
                                ),
                                undefined,
                                [
                                    ts.factory.createThis(),
                                    ts.factory.createIdentifier(AbstractParsedSingleUnionType.VISITOR_PARAMETER_NAME),
                                ]
                            )
                        ),
                    ],
                    true
                )
            )
        );
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return this.singleUnionType.getBuilderArgsFromExistingValue(existingValue);
    }

    private getDiscriminantKey(): string {
        return AbstractParsedSingleUnionType.getDiscriminantKey(this.getDiscriminant());
    }

    public static getDiscriminantKey(discriminant: WireStringWithAllCasings): string {
        return discriminant.camelCase;
    }

    public getVisitMethod({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.ArrowFunction {
        return ts.factory.createArrowFunction(
            undefined,
            [],
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    GeneratedUnionImpl.VISITOR_PARAMETER_NAME
                ),
            ],
            undefined,
            undefined,
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_PARAMETER_NAME),
                    ts.factory.createIdentifier(this.getVisitorKey())
                ),
                undefined,
                this.singleUnionType.getVisitorArguments({ localReferenceToUnionValue })
            )
        );
    }

    public getVisitMethodSignature(context: Context): ts.FunctionTypeNode {
        return AbstractParsedSingleUnionType.getVisitorPropertySignature({
            parameterType: this.singleUnionType.getVisitMethodParameterType(context),
        });
    }

    public static getVisitorPropertySignature({
        parameterType,
    }: {
        parameterType: ts.TypeNode | undefined;
    }): ts.FunctionTypeNode {
        return ts.factory.createFunctionTypeNode(
            undefined,
            parameterType != null
                ? [
                      ts.factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          GeneratedUnionImpl.VISITEE_PARAMETER_NAME,
                          undefined,
                          parameterType
                      ),
                  ]
                : [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE))
        );
    }

    public invokeVisitMethod({
        localReferenceToUnionValue,
        localReferenceToVisitor,
    }: {
        localReferenceToUnionValue: ts.Expression;
        localReferenceToVisitor: ts.Expression;
    }): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(localReferenceToVisitor, this.getVisitorKey()),
            undefined,
            this.singleUnionType.getVisitorArguments({ localReferenceToUnionValue })
        );
    }

    public abstract getDocs(): string | null | undefined;
    public abstract getDiscriminantValue(): string;
    public abstract getInterfaceName(): string;
    public abstract getBuilderName(): string;
    public abstract getVisitorKey(): string;
    protected abstract getDiscriminant(): WireStringWithAllCasings;
}
