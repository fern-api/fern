import { EnumTypeDeclaration, EnumValue, ExampleTypeShape } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { BaseContext, GeneratedEnumType } from "@fern-typescript/contexts";
import {
    ModuleDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    StatementStructures,
    StructureKind,
    TypeAliasDeclarationStructure,
    ts,
    VariableDeclarationKind,
    VariableStatementStructure,
    WriterFunction
} from "ts-morph";

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
    private static readonly VISITOR_INTERFACE_NAME = "Visitor";
    private static readonly OTHER_VISITOR_METHOD_NAME = "_other";
    private static readonly VISITOR_RETURN_TYPE_PARAMETER = "R";
    private static readonly VISIT_PROPERTTY_NAME = "_visit";
    private static readonly VISIT_VALUE_PARAMETER_NAME = "value";
    private static readonly VISITOR_PARAMETER_NAME = "visitor";

    public readonly type = "enum";
    private includeEnumUtils: boolean;

    constructor({ includeEnumUtils, ...superInit }: GeneratedEnumTypeImpl.Init<Context>) {
        super(superInit);
        this.includeEnumUtils = includeEnumUtils;
    }

    private generateEnumType(context: Context): TypeAliasDeclarationStructure {
        const typeofConst = this.includeEnumUtils
            ? `Omit<typeof ${this.typeName}, "${GeneratedEnumTypeImpl.VISIT_PROPERTTY_NAME}">`
            : `typeof ${this.typeName}`;
        const baseType = `${typeofConst}[keyof ${typeofConst}]`;
        const type: TypeAliasDeclarationStructure = {
            kind: StructureKind.TypeAlias,
            name: this.typeName,
            isExported: true,
            type: this.includeSerdeLayer ? baseType : `${baseType} | string`
        };

        return type;
    }

    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        const enumLiteralTypes = this.shape.values.map((value) =>
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.name.wireValue))
        );

        const unionMembers = this.includeSerdeLayer
            ? enumLiteralTypes
            : [...enumLiteralTypes, ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)];

        return {
            typeNode: ts.factory.createParenthesizedType(ts.factory.createUnionTypeNode(unionMembers)),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        };
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: (string | WriterFunction | StatementStructures)[] = [
            this.generateConst(context),
            this.generateEnumType(context)
        ];

        if (this.includeEnumUtils) {
            statements.push(this.generateModule());
        }
        return statements;
    }

    private printDocs(docs: string | undefined): string {
        if (docs == null) {
            return "";
        }
        return getTextOfTsNode(ts.factory.createJSDocComment(docs)) + "\n";
    }

    private generateConst(context: Context): VariableStatementStructure {
        const constProperties = this.shape.values.map((value) =>
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(this.printDocs(value.docs) + getPropertyKey(this.getEnumValueName(value))),
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
                            )
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
                                        )
                                    ]
                                ),
                                undefined
                            )
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
                                                    )
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
                                            )
                                        ])
                                    ])
                                )
                            ],
                            true
                        )
                    )
                )
            );
        }
        const docs = this.getDocs({ context });
        return {
            kind: StructureKind.VariableStatement,
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
                    )
                }
            ],
            docs: docs != null ? [docs] : undefined
        };
    }

    public generateModule(): ModuleDeclarationStructure {
        const enumModule: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: GeneratedEnumTypeImpl.VISITOR_INTERFACE_NAME,
                    typeParameters: [GeneratedEnumTypeImpl.VISITOR_RETURN_TYPE_PARAMETER],
                    properties: [
                        ...this.shape.values.map(
                            (enumValue): OptionalKind<PropertySignatureStructure> => ({
                                name: getPropertyKey(this.getEnumValueVisitPropertyName(enumValue)),
                                type: getTextOfTsNode(
                                    ts.factory.createFunctionTypeNode(
                                        undefined,
                                        [],
                                        ts.factory.createTypeReferenceNode(
                                            GeneratedEnumTypeImpl.VISITOR_RETURN_TYPE_PARAMETER,
                                            undefined
                                        )
                                    )
                                )
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
                            )
                        }
                    ],
                    isExported: true
                }
            ]
        };

        return enumModule;
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "enum") {
            throw new Error("Example is not for an enum");
        }

        let enumValue = this.shape.values.find((enumValue) => enumValue.name.wireValue === example.value.wireValue);
        if (enumValue == null) {
            const defaultEnumValue = this.shape.values[0];
            // If no matching enum value, pick the first value from the enum definition
            if (defaultEnumValue == null) {
                throw new Error("Enum has no values defined.");
            }
            // Use the first enum value as a fallback
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            enumValue = defaultEnumValue;
        }
        if (opts.isForTypeDeclarationComment) {
            return ts.factory.createPropertyAccessExpression(
                this.getReferenceToSelf(context).getExpression(opts),
                this.getEnumValueName(enumValue)
            );
        } else {
            return ts.factory.createStringLiteral(example.value.wireValue);
        }
    }

    private getEnumValueName(enumValue: EnumValue): string {
        return enumValue.name.name.pascalCase.unsafeName;
    }

    private getEnumValueVisitPropertyName(enumValue: EnumValue): string {
        return enumValue.name.name.camelCase.unsafeName;
    }
}
