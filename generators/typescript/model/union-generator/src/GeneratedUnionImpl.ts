import {
    FernWriters,
    ObjectWriter,
    Reference,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocsStructure
} from "@fern-typescript/commons";
import { GeneratedUnion, ModelContext } from "@fern-typescript/contexts";
import {
    InterfaceDeclarationStructure,
    ModuleDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    StatementStructures,
    StructureKind,
    TypeAliasDeclarationStructure,
    VariableDeclarationKind,
    VariableStatementStructure,
    WriterFunction,
    ts
} from "ts-morph";

import { ObjectProperty } from "@fern-fern/ir-sdk/api";

import { KnownSingleUnionType } from "./known-single-union-type/KnownSingleUnionType";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";

export declare namespace GeneratedUnionImpl {
    export interface Init<Context extends ModelContext> {
        typeName: string;
        discriminant: string;
        getDocs: ((context: Context) => string | null | undefined) | undefined;
        parsedSingleUnionTypes: KnownSingleUnionType<Context>[];
        unknownSingleUnionType: ParsedSingleUnionType<Context>;
        getReferenceToUnion: (context: Context) => Reference;
        includeUtilsOnUnionMembers: boolean;
        /**
         * @default the value of includeUtilsOnUnionMembers
         */
        includeConstBuilders?: boolean;
        includeOtherInUnionTypes: boolean;
        baseProperties?: ObjectProperty[];
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        noOptionalProperties: boolean;
        inline: boolean;
        enableInlineTypes: boolean;
    }
}

export class GeneratedUnionImpl<Context extends ModelContext> implements GeneratedUnion<Context> {
    public static readonly UTILS_INTERFACE_NAME = "_Utils";
    public static readonly BASE_INTERFACE_NAME = "_Base";
    public static readonly VISITOR_INTERFACE_NAME = "_Visitor";
    public static readonly VISITOR_RETURN_TYPE = "_Result";
    public static readonly VISITOR_PARAMETER_NAME = "visitor";
    public static readonly VISITEE_PARAMETER_NAME = "value";
    public static readonly UNKNOWN_VISITOR_KEY = "_other";
    public static readonly VISIT_UTIL_PROPERTY_NAME = "_visit";

    public readonly getReferenceToUnion: (context: Context) => Reference;
    public readonly discriminant: string;
    public readonly visitPropertyName = GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME;

    private getDocs: ((context: Context) => string | null | undefined) | undefined;
    private typeName: string;
    private parsedSingleUnionTypes: KnownSingleUnionType<Context>[];
    private unknownSingleUnionType: ParsedSingleUnionType<Context>;
    private includeUtilsOnUnionMembers: boolean;
    private includeOtherInUnionTypes: boolean;
    private baseProperties: ObjectProperty[];
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private includeConstBuilders: boolean;
    private noOptionalProperties: boolean;
    private inline: boolean;
    private enableInlineTypes: boolean;

    constructor({
        typeName,
        discriminant,
        getDocs,
        parsedSingleUnionTypes,
        unknownSingleUnionType,
        getReferenceToUnion,
        includeUtilsOnUnionMembers,
        includeConstBuilders = includeUtilsOnUnionMembers,
        includeOtherInUnionTypes,
        baseProperties = [],
        includeSerdeLayer,
        retainOriginalCasing,
        noOptionalProperties,
        inline,
        enableInlineTypes
    }: GeneratedUnionImpl.Init<Context>) {
        this.getReferenceToUnion = getReferenceToUnion;
        this.discriminant = discriminant;
        this.getDocs = getDocs;
        this.typeName = typeName;
        this.parsedSingleUnionTypes = parsedSingleUnionTypes;
        this.unknownSingleUnionType = unknownSingleUnionType;
        this.includeUtilsOnUnionMembers = includeUtilsOnUnionMembers;
        this.includeOtherInUnionTypes = includeOtherInUnionTypes;
        this.baseProperties = baseProperties;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.includeConstBuilders = includeConstBuilders;
        this.noOptionalProperties = noOptionalProperties;
        this.inline = inline;
        this.enableInlineTypes = enableInlineTypes;
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: (string | WriterFunction | StatementStructures)[] = [
            this.generateTypeAlias(context),
            this.generateModule(context)
        ];

        if (this.includeConstBuilders) {
            const consts = this.generateConst(context);
            if (consts) {
                statements.push(consts);
            }
        }
        return statements;
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        return ts.factory.createParenthesizedType(
            ts.factory.createUnionTypeNode(
                this.getAllSingleUnionTypesForAlias().map((singleUnionType) =>
                    singleUnionType.generateForInlineUnion(context, this)
                )
            )
        );
    }

    public getReferenceTo(context: Context): ts.TypeNode {
        return this.getReferenceToUnion(context).getTypeNode();
    }

    public build({
        discriminantValueToBuild,
        builderArgument,
        nonDiscriminantProperties,
        context
    }: {
        discriminantValueToBuild: string | number;
        builderArgument: ts.Expression | undefined;
        nonDiscriminantProperties: ts.ObjectLiteralElementLike[];
        context: Context;
    }): ts.Expression {
        const singleUnionType = this.getSingleUnionType(discriminantValueToBuild);
        if (this.includeUtilsOnUnionMembers) {
            return this.buildWithBuilder({
                discriminantValueToBuild,
                builderArgument,
                context
            });
        } else {
            return ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier(this.discriminant),
                        singleUnionType.getDiscriminantValueAsExpression()
                    ),
                    ...nonDiscriminantProperties
                ],
                true
            );
        }
    }

    public buildWithBuilder({
        discriminantValueToBuild,
        builderArgument,
        context
    }: {
        discriminantValueToBuild: string | number;
        builderArgument: ts.Expression | undefined;
        context: Context;
    }): ts.Expression {
        const singleUnionType = this.getSingleUnionType(discriminantValueToBuild);
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToUnion(context).getExpression(),
                singleUnionType.getBuilderName()
            ),
            undefined,
            builderArgument != null ? [builderArgument] : []
        );
    }

    public buildFromExistingValue({
        discriminantValueToBuild,
        existingValue,
        context
    }: {
        discriminantValueToBuild: string | number;
        existingValue: ts.Expression;
        context: Context;
    }): ts.Expression {
        const singleUnionType = this.getSingleUnionType(discriminantValueToBuild);
        return this.buildSingleUnionTypeFromExistingValue({
            existingValue,
            context,
            singleUnionType
        });
    }

    public buildUnknown({ existingValue, context }: { existingValue: ts.Expression; context: Context }): ts.Expression {
        if (this.includeOtherInUnionTypes) {
            return this.buildSingleUnionTypeFromExistingValue({
                existingValue,
                context,
                singleUnionType: this.unknownSingleUnionType
            });
        } else {
            return ts.factory.createAsExpression(existingValue, this.getReferenceToUnion(context).getTypeNode());
        }
    }

    private buildSingleUnionTypeFromExistingValue({
        singleUnionType,
        context,
        existingValue
    }: {
        singleUnionType: ParsedSingleUnionType<Context>;
        context: Context;
        existingValue: ts.Expression;
    }): ts.Expression {
        if (!this.includeConstBuilders) {
            throw new Error("Cannot build single union type because builders were not generated");
        }
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToUnion(context).getExpression(),
                singleUnionType.getBuilderName()
            ),
            undefined,
            singleUnionType.getBuilderArgsFromExistingValue(existingValue)
        );
    }

    public getUnknownDiscriminantValueType(): ts.TypeNode {
        return this.unknownSingleUnionType.getDiscriminantValueType();
    }

    public getBasePropertyKey(rawKey: string): string {
        const baseProperty = this.baseProperties.find((property) => property.name.wireValue === rawKey);
        if (baseProperty == null) {
            throw new Error("No base property exists for key " + rawKey);
        }
        return this._getBasePropertyKey(baseProperty);
    }

    private _getBasePropertyKey(baseProperty: ObjectProperty): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return baseProperty.name.name.camelCase.unsafeName;
        } else {
            return baseProperty.name.wireValue;
        }
    }

    /**************
     * TYPE ALIAS *
     **************/

    private generateTypeAlias(context: Context): TypeAliasDeclarationStructure {
        const typeAlias: TypeAliasDeclarationStructure = {
            kind: StructureKind.TypeAlias,
            name: this.typeName,
            type: getWriterForMultiLineUnionType(
                this.getAllSingleUnionTypesForAlias().map((singleUnionType) => ({
                    node: this.getReferenceToSingleUnionType(singleUnionType, context),
                    docs: singleUnionType.getDocs()
                }))
            ),
            isExported: true
        };
        maybeAddDocsStructure(typeAlias, this.getDocs?.(context));
        return typeAlias;
    }

    public getReferenceToSingleUnionType(
        singleUnionType: ParsedSingleUnionType<Context>,
        context: Context
    ): ts.TypeNode {
        if (this.enableInlineTypes && this.inline) {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(this.typeName),
                    singleUnionType.getInterfaceName()
                )
            );
        }
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                singleUnionType.getInterfaceName()
            )
        );
    }

    /**********
     * MODULE *
     **********/

    private generateModule(context: Context): ModuleDeclarationStructure {
        const module: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false
        };
        const statements = [...this.getSingleUnionTypeInterfaces(context)];
        if (this.includeUtilsOnUnionMembers) {
            statements.push(this.getUtilsInterface(context));
        }
        if (this.includeUtilsOnUnionMembers || this.includeConstBuilders) {
            statements.push(this.getVisitorInterface(context));
        }
        if (this.hasBaseInterface()) {
            statements.push(this.getBaseInterface(context));
        }
        module.statements = statements;
        return module;
    }

    private getSingleUnionTypeInterfaces(context: Context): StatementStructures[] {
        const statements: StatementStructures[] = [];
        const interfaces = this.getAllSingleUnionTypesForAlias().map((singleUnionType) =>
            singleUnionType.getInterfaceDeclaration(context, this)
        );

        for (const interface_ of interfaces) {
            if (this.hasBaseInterface()) {
                interface_.extends.push(ts.factory.createTypeReferenceNode(GeneratedUnionImpl.BASE_INTERFACE_NAME));
            }
            if (this.includeUtilsOnUnionMembers) {
                interface_.extends.push(ts.factory.createTypeReferenceNode(GeneratedUnionImpl.UTILS_INTERFACE_NAME));
            }
        }

        for (const interface_ of interfaces) {
            statements.push({
                kind: StructureKind.Interface,
                name: interface_.name,
                isExported: true,
                extends: interface_.extends.map(getTextOfTsNode),
                properties: interface_.properties
            });
            if (interface_.module) {
                statements.push(interface_.module);
            }
        }
        return statements;
    }

    private getUtilsInterface(context: Context): InterfaceDeclarationStructure {
        return {
            kind: StructureKind.Interface,
            name: GeneratedUnionImpl.UTILS_INTERFACE_NAME,
            properties: [
                {
                    name: GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME,
                    type: getTextOfTsNode(this.getVisitSignature(context))
                }
            ],
            isExported: true
        };
    }

    private getBaseInterface(context: Context): InterfaceDeclarationStructure {
        return {
            kind: StructureKind.Interface,
            name: GeneratedUnionImpl.BASE_INTERFACE_NAME,
            properties: this.baseProperties.map((property) => {
                const type = context.type.getReferenceToType(property.valueType);
                return {
                    name: this._getBasePropertyKey(property),
                    docs: property.docs != null ? [property.docs] : undefined,
                    type: getTextOfTsNode(this.noOptionalProperties ? type.typeNode : type.typeNodeWithoutUndefined),
                    hasQuestionToken: !this.noOptionalProperties && type.isOptional
                };
            }),
            isExported: true
        };
    }

    private getVisitSignature(context: Context): ts.FunctionTypeNode {
        return ts.factory.createFunctionTypeNode(
            [
                ts.factory.createTypeParameterDeclaration(
                    undefined,
                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE),
                    undefined,
                    undefined
                )
            ],
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_PARAMETER_NAME),
                    undefined,
                    this.getReferenceToVisitorInterface(context)
                )
            ],
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE),
                undefined
            )
        );
    }

    private getVisitorInterface(context: Context): InterfaceDeclarationStructure {
        return {
            kind: StructureKind.Interface,
            name: GeneratedUnionImpl.VISITOR_INTERFACE_NAME,
            typeParameters: [
                {
                    name: GeneratedUnionImpl.VISITOR_RETURN_TYPE
                }
            ],
            properties: this.getAllSingleUnionTypesIncludingUnknown().map<OptionalKind<PropertySignatureStructure>>(
                (singleUnionType) => ({
                    name: singleUnionType.getVisitorKey(),
                    type: getTextOfTsNode(singleUnionType.getVisitMethodSignature(context, this))
                })
            ),
            isExported: true
        };
    }

    public getReferenceToVisitorInterface(context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                GeneratedUnionImpl.VISITOR_INTERFACE_NAME
            ),
            [ts.factory.createTypeReferenceNode(GeneratedUnionImpl.VISITOR_RETURN_TYPE)]
        );
    }

    /*********
     * CONST *
     *********/

    private generateConst(context: Context): VariableStatementStructure | undefined {
        const writer = FernWriters.object.writer({ asConst: true });

        this.addBuilderProperties(context, writer);
        this.addVisitProperty(context, writer);

        if (writer.isEmpty) {
            return;
        }

        return {
            kind: StructureKind.VariableStatement,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.typeName,
                    initializer: writer.toFunction()
                }
            ],
            isExported: true
        };
    }

    private addBuilderProperties(context: Context, writer: ObjectWriter) {
        if (this.hasBaseInterface()) {
            throw new Error("Cannot create builders because union has base properties");
        }

        const singleUnionTypes = this.includeOtherInUnionTypes
            ? this.getAllSingleUnionTypesIncludingUnknown()
            : this.parsedSingleUnionTypes;
        for (const singleUnionType of singleUnionTypes) {
            writer.addProperty({
                key: singleUnionType.getBuilderName(),
                value: getTextOfTsNode(singleUnionType.getBuilder(context, this))
            });
            writer.addNewLine();
        }
    }

    private addVisitProperty(context: Context, writer: ObjectWriter) {
        const referenceToUnion = this.getReferenceToUnion(context);
        writer.addProperty({
            key: GeneratedUnionImpl.VISIT_UTIL_PROPERTY_NAME,
            value: getTextOfTsNode(
                ts.factory.createArrowFunction(
                    undefined,
                    [
                        ts.factory.createTypeParameterDeclaration(
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE)
                        )
                    ],
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionImpl.VISITEE_PARAMETER_NAME),
                            undefined,
                            referenceToUnion.getTypeNode(),
                            undefined
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_PARAMETER_NAME),
                            undefined,
                            this.getReferenceToVisitorInterface(context),
                            undefined
                        )
                    ],
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier(GeneratedUnionImpl.VISITOR_RETURN_TYPE),
                        undefined
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(
                        [
                            ts.factory.createSwitchStatement(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(GeneratedUnionImpl.VISITEE_PARAMETER_NAME),
                                    ts.factory.createIdentifier(this.discriminant)
                                ),
                                ts.factory.createCaseBlock([
                                    ...this.parsedSingleUnionTypes.map((parsedSingleUnionType) =>
                                        ts.factory.createCaseClause(
                                            parsedSingleUnionType.getDiscriminantValueAsExpression(),
                                            [
                                                ts.factory.createReturnStatement(
                                                    parsedSingleUnionType.invokeVisitMethod({
                                                        localReferenceToUnionValue: ts.factory.createIdentifier(
                                                            GeneratedUnionImpl.VISITEE_PARAMETER_NAME
                                                        ),
                                                        localReferenceToVisitor: ts.factory.createIdentifier(
                                                            GeneratedUnionImpl.VISITOR_PARAMETER_NAME
                                                        )
                                                    })
                                                )
                                            ]
                                        )
                                    ),
                                    ts.factory.createDefaultClause([
                                        ts.factory.createReturnStatement(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier(
                                                        GeneratedUnionImpl.VISITOR_PARAMETER_NAME
                                                    ),
                                                    ts.factory.createIdentifier(GeneratedUnionImpl.UNKNOWN_VISITOR_KEY)
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createAsExpression(
                                                        ts.factory.createIdentifier(
                                                            GeneratedUnionImpl.VISITEE_PARAMETER_NAME
                                                        ),
                                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                                    )
                                                ]
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
        });
    }

    private getAllSingleUnionTypesForAlias(): ParsedSingleUnionType<Context>[] {
        const singleUnionTypes: ParsedSingleUnionType<Context>[] = [...this.parsedSingleUnionTypes];
        if (this.includeOtherInUnionTypes) {
            singleUnionTypes.push(this.unknownSingleUnionType);
        }
        return singleUnionTypes;
    }

    private getAllSingleUnionTypesIncludingUnknown(): ParsedSingleUnionType<Context>[] {
        return [...this.parsedSingleUnionTypes, this.unknownSingleUnionType];
    }

    private hasBaseInterface(): boolean {
        return this.baseProperties.length > 0;
    }

    private getSingleUnionType(discriminantValue: string | number): KnownSingleUnionType<Context> {
        const singleUnionType = this.parsedSingleUnionTypes.find(
            (singleUnionType) => singleUnionType.getDiscriminantValue() === discriminantValue
        );
        if (singleUnionType == null) {
            throw new Error(`No single union type exists for discriminant value "${discriminantValue}"`);
        }
        return singleUnionType;
    }
}
