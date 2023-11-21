import { EnumTypeDeclaration, EnumValue, ExampleTypeShape } from "@fern-fern/ir-sdk/api";
import {
    GetReferenceOpts,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
} from "@fern-typescript/commons";
import { BaseContext, GeneratedEnumType } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts, VariableDeclarationKind } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export declare namespace GeneratedEnumTypeImpl {
    export interface Init<Context> extends AbstractGeneratedType.Init<EnumTypeDeclaration, Context> {
        includeEnumUtils: boolean;
    }
}

export class GeneratedEnumTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<EnumTypeDeclaration, Context>
    implements GeneratedEnumType<Context>
{
    private static VISITOR_INTERFACE_NAME = "Visitor";
    private static OTHER_VISITOR_METHOD_NAME = "_other";
    private static VISITOR_RETURN_TYPE_PARAMETER = "R";
    private static VISIT_PROPERTTY_NAME = "_visit";
    private static VISIT_VALUE_PARAMETER_NAME = "value";
    private static VISITOR_PARAMETER_NAME = "visitor";

    public readonly type = "enum";
    private includeEnumUtils: boolean;

    constructor({ includeEnumUtils, ...superInit }: GeneratedEnumTypeImpl.Init<Context>) {
        super(superInit);
        this.includeEnumUtils = includeEnumUtils;
    }

    public writeToFile(context: Context): void {
        const type = context.sourceFile.addTypeAlias({
            name: this.typeName,
            isExported: true,
            type: getWriterForMultiLineUnionType(
                this.shape.values.map((value) => ({
                    docs: value.docs,
                    node: ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.name.wireValue)),
                }))
            ),
        });

        maybeAddDocs(type, this.getDocs(context));

        this.addConst(context);

        if (this.includeEnumUtils) {
            this.addModule(context);
        }
    }

    private addConst(context: Context) {
        const constProperties = this.shape.values.map((value) =>
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(this.getEnumValueName(value)),
                ts.factory.createStringLiteral(value.name.wireValue)
            )
        );
        if (this.includeEnumUtils) {
            constProperties.push(
                ts.factory.createPropertyAssignment(
                    GeneratedEnumTypeImpl.VISIT_PROPERTTY_NAME,
                    ts.factory.createArrowFunction(
                        undefined,
                        [
                            ts.factory.createTypeParameterDeclaration(
                                undefined,
                                GeneratedEnumTypeImpl.VISITOR_RETURN_TYPE_PARAMETER,
                                undefined,
                                undefined
                            ),
                        ],
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                GeneratedEnumTypeImpl.VISIT_VALUE_PARAMETER_NAME,
                                undefined,
                                ts.factory.createTypeReferenceNode(this.typeName, undefined),
                                undefined
                            ),
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                GeneratedEnumTypeImpl.VISITOR_PARAMETER_NAME,
                                undefined,
                                ts.factory.createTypeReferenceNode(
                                    ts.factory.createQualifiedName(
                                        ts.factory.createIdentifier(this.typeName),
                                        GeneratedEnumTypeImpl.VISITOR_INTERFACE_NAME
                                    ),
                                    [
                                        ts.factory.createTypeReferenceNode(
                                            GeneratedEnumTypeImpl.VISITOR_RETURN_TYPE_PARAMETER,
                                            undefined
                                        ),
                                    ]
                                ),
                                undefined
                            ),
                        ],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createBlock(
                            [
                                ts.factory.createSwitchStatement(
                                    ts.factory.createIdentifier(GeneratedEnumTypeImpl.VISIT_VALUE_PARAMETER_NAME),
                                    ts.factory.createCaseBlock([
                                        ...this.shape.values.map((enumValue) =>
                                            ts.factory.createCaseClause(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier(this.typeName),
                                                    this.getEnumValueName(enumValue)
                                                ),
                                                [
                                                    ts.factory.createReturnStatement(
                                                        ts.factory.createCallExpression(
                                                            ts.factory.createPropertyAccessExpression(
                                                                ts.factory.createIdentifier(
                                                                    GeneratedEnumTypeImpl.VISITOR_PARAMETER_NAME
                                                                ),
                                                                this.getEnumValueVisitPropertyName(enumValue)
                                                            ),
                                                            undefined,
                                                            []
                                                        )
                                                    ),
                                                ]
                                            )
                                        ),
                                        ts.factory.createDefaultClause([
                                            ts.factory.createReturnStatement(
                                                ts.factory.createCallExpression(
                                                    ts.factory.createPropertyAccessExpression(
                                                        ts.factory.createIdentifier(
                                                            GeneratedEnumTypeImpl.VISITOR_PARAMETER_NAME
                                                        ),
                                                        GeneratedEnumTypeImpl.OTHER_VISITOR_METHOD_NAME
                                                    ),
                                                    undefined,
                                                    []
                                                )
                                            ),
                                        ]),
                                    ])
                                ),
                            ],
                            true
                        )
                    )
                )
            );
        }

        context.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: this.typeName,
                    initializer: getTextOfTsNode(
                        ts.factory.createAsExpression(
                            ts.factory.createObjectLiteralExpression(constProperties, true),
                            ts.factory.createTypeReferenceNode("const")
                        )
                    ),
                },
            ],
        });
    }

    private addModule(context: Context) {
        const enumModule = context.sourceFile.addModule({
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: true,
        });

        enumModule.addInterface({
            name: GeneratedEnumTypeImpl.VISITOR_INTERFACE_NAME,
            typeParameters: [GeneratedEnumTypeImpl.VISITOR_RETURN_TYPE_PARAMETER],
            properties: [
                ...this.shape.values.map(
                    (enumValue): OptionalKind<PropertySignatureStructure> => ({
                        name: this.getEnumValueVisitPropertyName(enumValue),
                        type: getTextOfTsNode(
                            ts.factory.createFunctionTypeNode(
                                undefined,
                                [],
                                ts.factory.createTypeReferenceNode(
                                    GeneratedEnumTypeImpl.VISITOR_RETURN_TYPE_PARAMETER,
                                    undefined
                                )
                            )
                        ),
                    })
                ),
                {
                    name: GeneratedEnumTypeImpl.OTHER_VISITOR_METHOD_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            [],
                            ts.factory.createTypeReferenceNode(
                                GeneratedEnumTypeImpl.VISITOR_RETURN_TYPE_PARAMETER,
                                undefined
                            )
                        )
                    ),
                },
            ],
        });
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "enum") {
            throw new Error("Example is not for an enum");
        }

        const enumValue = this.shape.values.find((enumValue) => enumValue.name.wireValue === example.value.wireValue);
        if (enumValue == null) {
            throw new Error("No enum with wire value: " + example.value.wireValue);
        }
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToSelf(context).getExpression(opts),
            this.getEnumValueName(enumValue)
        );
    }

    private getEnumValueName(enumValue: EnumValue): string {
        return enumValue.name.name.pascalCase.unsafeName;
    }

    private getEnumValueVisitPropertyName(enumValue: EnumValue): string {
        return enumValue.name.name.camelCase.unsafeName;
    }
}
