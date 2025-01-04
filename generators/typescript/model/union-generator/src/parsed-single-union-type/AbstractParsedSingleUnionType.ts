import { getTextOfTsNode } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { GeneratedUnionImpl } from "../GeneratedUnionImpl";
import { SingleUnionTypeGenerator } from "../single-union-type-generator/SingleUnionTypeGenerator";
import { ParsedSingleUnionType } from "./ParsedSingleUnionType";

export declare namespace AbstractParsedSingleUnionType {
    export interface Init<Context extends ModelContext> {
        singleUnionType: SingleUnionTypeGenerator<Context>;
        includeUtilsOnUnionMembers: boolean;
    }
}

export abstract class AbstractParsedSingleUnionType<Context extends ModelContext>
    implements ParsedSingleUnionType<Context>
{
    private static VISITOR_PARAMETER_NAME = "visitor";

    protected singleUnionType: SingleUnionTypeGenerator<Context>;
    private includeUtilsOnUnionMembers: boolean;

    constructor({ singleUnionType, includeUtilsOnUnionMembers }: AbstractParsedSingleUnionType.Init<Context>) {
        this.singleUnionType = singleUnionType;
        this.includeUtilsOnUnionMembers = includeUtilsOnUnionMembers;
    }

    public getInterfaceDeclaration(
        context: Context,
        generatedUnion: GeneratedUnionImpl<Context>
    ): ParsedSingleUnionType.InterfaceDeclaration {
        return {
            name: this.getInterfaceName(),
            extends: this.singleUnionType.getExtendsForInterface(context),
            properties: [
                {
                    name: generatedUnion.discriminant,
                    type: getTextOfTsNode(this.getDiscriminantValueType())
                },
                ...this.singleUnionType.getDiscriminantPropertiesForInterface(context),
                ...this.singleUnionType.getNonDiscriminantPropertiesForInterface(context)
            ],
            module: this.singleUnionType.generateModule(context)
        };
    }

    public generateForInlineUnion(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.TypeNode {
        return this.singleUnionType.generateForInlineUnion(context);
    }

    public getBuilder(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.ArrowFunction {
        const referenceToBuiltType = generatedUnion.getReferenceToSingleUnionType(this, context);

        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            this.singleUnionType.getParametersForBuilder(context, { discriminant: generatedUnion.discriminant }),
            referenceToBuiltType,
            undefined,
            ts.factory.createBlock(
                [
                    ts.factory.createReturnStatement(
                        ts.factory.createObjectLiteralExpression(
                            this.includeUtilsOnUnionMembers
                                ? [
                                      ...this.getNonVisitProperties({ context, generatedUnion }),
                                      ts.factory.createPropertyAssignment(
                                          ts.factory.createStringLiteral(GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME),
                                          ts.factory.createFunctionExpression(
                                              undefined,
                                              undefined,
                                              undefined,
                                              [
                                                  ts.factory.createTypeParameterDeclaration(
                                                      undefined,
                                                      GeneratedUnionImpl.VISITOR_RETURN_TYPE
                                                  )
                                              ],
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
                                                  )
                                              ],
                                              undefined,
                                              ts.factory.createBlock(
                                                  [
                                                      ts.factory.createReturnStatement(
                                                          ts.factory.createCallExpression(
                                                              ts.factory.createPropertyAccessExpression(
                                                                  generatedUnion
                                                                      .getReferenceToUnion(context)
                                                                      .getExpression(),
                                                                  GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME
                                                              ),
                                                              undefined,
                                                              [
                                                                  ts.factory.createThis(),
                                                                  ts.factory.createIdentifier(
                                                                      AbstractParsedSingleUnionType.VISITOR_PARAMETER_NAME
                                                                  )
                                                              ]
                                                          )
                                                      )
                                                  ],
                                                  true
                                              )
                                          )
                                      )
                                  ]
                                : this.getNonVisitProperties({ context, generatedUnion }),
                            true
                        )
                    )
                ],
                true
            )
        );
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return this.singleUnionType.getBuilderArgsFromExistingValue(existingValue);
    }

    public getVisitMethod({
        localReferenceToUnionValue
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
                )
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

    public getVisitMethodSignature(context: Context, generatedUnion: GeneratedUnionImpl<Context>): ts.FunctionTypeNode {
        const parameterType = this.singleUnionType.getVisitMethodParameterType(context, {
            discriminant: generatedUnion.discriminant
        });
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
                      )
                  ]
                : [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE))
        );
    }

    public invokeVisitMethod({
        localReferenceToUnionValue,
        localReferenceToVisitor
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

    public abstract getDiscriminantValueType(): ts.TypeNode;

    public getDiscriminantValueOrThrow(): string | number {
        const discriminantValue = this.getDiscriminantValue();
        if (discriminantValue == null) {
            throw new Error("Discriminant value is not defined");
        }
        return discriminantValue;
    }

    protected abstract getNonVisitProperties({
        context,
        generatedUnion
    }: {
        context: Context;
        generatedUnion: GeneratedUnionImpl<Context>;
    }): ts.ObjectLiteralElementLike[];

    public abstract getDocs(): string | null | undefined;
    public abstract getDiscriminantValue(): string | number | undefined;
    public abstract getDiscriminantValueAsExpression(): ts.Expression;
    public abstract getInterfaceName(): string;
    public abstract getBuilderName(): string;
    public abstract getVisitorKey(): string;
}
