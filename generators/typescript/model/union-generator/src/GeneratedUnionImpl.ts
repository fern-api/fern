import { assertNever } from "@fern-api/core-utils";
import { ObjectProperty, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import {
    FernWriters,
    getPropertyKey,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocsStructure,
    ObjectWriter,
    Reference
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
    ts,
    VariableDeclarationKind,
    VariableStatementStructure,
    WriterFunction
} from "ts-morph";
import { FernIr } from "../../../../../packages/ir-sdk/src";
import { KnownSingleUnionType } from "./known-single-union-type/KnownSingleUnionType";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";

export declare namespace GeneratedUnionImpl {
    export interface Init<Context extends ModelContext> {
        typeName: string;
        shape: UnionTypeDeclaration | undefined;
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
        generateReadWriteOnlyTypes: boolean;
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

    private readonly getDocs: ((context: Context) => string | null | undefined) | undefined;
    private readonly typeName: string;
    private readonly shape: UnionTypeDeclaration | undefined;
    private readonly parsedSingleUnionTypes: KnownSingleUnionType<Context>[];
    private readonly unknownSingleUnionType: ParsedSingleUnionType<Context>;
    private readonly includeUtilsOnUnionMembers: boolean;
    private readonly includeOtherInUnionTypes: boolean;
    private readonly baseProperties: ObjectProperty[];
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly includeConstBuilders: boolean;
    private readonly noOptionalProperties: boolean;
    private readonly inline: boolean;
    private readonly enableInlineTypes: boolean;
    private readonly generateReadWriteOnlyTypes: boolean;

    constructor({
        typeName,
        shape,
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
        enableInlineTypes,
        generateReadWriteOnlyTypes
    }: GeneratedUnionImpl.Init<Context>) {
        this.getReferenceToUnion = getReferenceToUnion;
        this.discriminant = discriminant;
        this.getDocs = getDocs;
        this.typeName = typeName;
        this.shape = shape;
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
        this.generateReadWriteOnlyTypes = generateReadWriteOnlyTypes;
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: (string | WriterFunction | StatementStructures)[] = [
            this.generateTypeAlias({ context, whatFor: "normal" }),
            this.generateModule(context)
        ];

        if (this.includeConstBuilders) {
            const consts = this.generateConst(context);
            if (consts) {
                statements.push(consts);
            }
        }

        // Generate type aliases for naming conflicts (consolidateTypeFiles)
        // These must come AFTER the module so they reference the outer types
        const typeAliases = this.getTypeAliasesForNamingConflicts(context);
        statements.push(...typeAliases);

        return statements;
    }

    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        const getTypesForInlineUnion = this.getAllSingleUnionTypesForAlias().map((singleUnionType) =>
            singleUnionType.generateForInlineUnion(context, this)
        );
        return {
            typeNode: ts.factory.createParenthesizedType(
                ts.factory.createUnionTypeNode(getTypesForInlineUnion.map((type) => type.typeNode))
            ),
            requestTypeNode: this.generateReadWriteOnlyTypes
                ? ts.factory.createParenthesizedType(
                      ts.factory.createUnionTypeNode(
                          getTypesForInlineUnion.map((type) => type.requestTypeNode ?? type.typeNode)
                      )
                  )
                : undefined,
            responseTypeNode: this.generateReadWriteOnlyTypes
                ? ts.factory.createParenthesizedType(
                      ts.factory.createUnionTypeNode(
                          getTypesForInlineUnion.map((type) => type.responseTypeNode ?? type.typeNode)
                      )
                  )
                : undefined
        };
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
                        ts.factory.createIdentifier(getPropertyKey(this.discriminant)),
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

    private generateTypeAlias({
        context,
        whatFor
    }: {
        context: Context;
        whatFor: "normal" | "request" | "response";
    }): TypeAliasDeclarationStructure {
        let typeName = (() => {
            switch (whatFor) {
                case "normal":
                    return this.typeName;
                case "request":
                    return "Request";
                case "response":
                    return "Response";
                default:
                    assertNever(whatFor);
            }
        })();
        const typeAlias: TypeAliasDeclarationStructure = {
            kind: StructureKind.TypeAlias,
            name: typeName,
            type: getWriterForMultiLineUnionType(
                this.getAllSingleUnionTypesForAlias().map((singleUnionType) => {
                    let node = this.getReferenceToSingleUnionType(singleUnionType, context);
                    if (this.generateReadWriteOnlyTypes && whatFor !== "normal") {
                        const needsRequestResponse = singleUnionType.needsRequestResponse(context);
                        if (needsRequestResponse.request && whatFor === "request") {
                            node = ts.factory.createTypeReferenceNode(
                                ts.factory.createQualifiedName(
                                    ts.factory.createIdentifier(getTextOfTsNode(node)),
                                    "Request"
                                )
                            );
                        } else if (needsRequestResponse.response && whatFor === "response") {
                            node = ts.factory.createTypeReferenceNode(
                                ts.factory.createQualifiedName(
                                    ts.factory.createIdentifier(getTextOfTsNode(node)),
                                    "Response"
                                )
                            );
                        }
                    }
                    return {
                        node,
                        docs: singleUnionType.getDocs()
                    };
                })
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
                    singleUnionType.getTypeName()
                )
            );
        }
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToUnion(context).getEntityName(),
                singleUnionType.getTypeName()
            )
        );
    }

    /**********
     * MODULE *
     **********/

    private generateModule(context: Context): ModuleDeclarationStructure {
        const statements = [...this.getSingleUnionTypeInterfaces(context)];
        if (this.includeUtilsOnUnionMembers) {
            statements.push(this.getUtilsInterface(context));
        }
        if (this.includeUtilsOnUnionMembers || this.includeConstBuilders) {
            statements.push(this.getVisitorInterface(context));
        }
        if (this.hasBaseInterface()) {
            const baseInterface = this.getBaseInterface(context);
            statements.push(baseInterface.normal);
            if (baseInterface.request || baseInterface.response) {
                const baseModuleStatements = [];
                if (baseInterface.request) {
                    baseModuleStatements.push(baseInterface.request);
                }
                if (baseInterface.response) {
                    baseModuleStatements.push(baseInterface.response);
                }
                statements.push({
                    kind: StructureKind.Module,
                    name: GeneratedUnionImpl.BASE_INTERFACE_NAME,
                    statements: baseModuleStatements,
                    isExported: true
                });
            }
        }

        if (this.shape) {
            const needsRequestResponseTypeVariant = context.type.needsRequestResponseTypeVariantByType(
                FernIr.Type.union(this.shape)
            );
            if (needsRequestResponseTypeVariant.request) {
                statements.push(this.generateTypeAlias({ context, whatFor: "request" }));
            }
            if (needsRequestResponseTypeVariant.response) {
                statements.push(this.generateTypeAlias({ context, whatFor: "response" }));
            }
        }

        const module: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false,
            statements
        };
        return module;
    }

    private getSingleUnionTypeInterfaces(context: Context): StatementStructures[] {
        const statements: StatementStructures[] = [];
        const interfaces = this.getAllSingleUnionTypesForAlias().map((singleUnionType) =>
            singleUnionType.getInterfaceDeclaration(context, this)
        );

        for (const interface_ of interfaces) {
            const hasBaseInterfaces = this.hasBaseInterfaces(context);
            if (hasBaseInterfaces.normal) {
                interface_.extends.push({
                    typeNode: ts.factory.createTypeReferenceNode(GeneratedUnionImpl.BASE_INTERFACE_NAME),
                    requestTypeNode: hasBaseInterfaces.request
                        ? ts.factory.createTypeReferenceNode(
                              ts.factory.createQualifiedName(
                                  ts.factory.createIdentifier(GeneratedUnionImpl.BASE_INTERFACE_NAME),
                                  "Request"
                              )
                          )
                        : undefined,
                    responseTypeNode: hasBaseInterfaces.response
                        ? ts.factory.createTypeReferenceNode(
                              ts.factory.createQualifiedName(
                                  ts.factory.createIdentifier(GeneratedUnionImpl.BASE_INTERFACE_NAME),
                                  "Response"
                              )
                          )
                        : undefined
                });
            }
            if (this.includeUtilsOnUnionMembers) {
                interface_.extends.push({
                    typeNode: ts.factory.createTypeReferenceNode(GeneratedUnionImpl.UTILS_INTERFACE_NAME),
                    requestTypeNode: undefined,
                    responseTypeNode: undefined
                });
            }
        }

        for (const interface_ of interfaces) {
            statements.push({
                kind: StructureKind.Interface,
                name: interface_.name,
                isExported: true,
                extends: interface_.extends.map((e) => getTextOfTsNode(e.typeNode)),
                properties: interface_.properties.map((p) => p.property)
            });
            if (interface_.module) {
                statements.push(interface_.module);
            }
            if (this.generateReadWriteOnlyTypes) {
                const anyRequestExtends = interface_.extends.some((e) => e.requestTypeNode != null);
                const anyResponseExtends = interface_.extends.some((e) => e.responseTypeNode != null);
                const anyReadonlyProperties = interface_.properties.some((p) => p.isReadonly);
                const anyWriteonlyProperties = interface_.properties.some((p) => p.isWriteonly);
                const anyRequestProperties = interface_.properties.some((p) => p.requestProperty != null);
                const anyResponseProperties = interface_.properties.some((p) => p.responseProperty != null);

                if (
                    anyRequestExtends ||
                    anyResponseExtends ||
                    anyReadonlyProperties ||
                    anyWriteonlyProperties ||
                    anyRequestProperties ||
                    anyResponseProperties
                ) {
                    const requestExtends = interface_.extends.map((e) => e.requestTypeNode ?? e.typeNode);
                    const responseExtends = interface_.extends.map((e) => e.responseTypeNode ?? e.typeNode);
                    const requestProperties = interface_.properties.filter((p) => p.isReadonly === false);
                    const responseProperties = interface_.properties.filter((p) => p.isWriteonly === false);
                    const moduleStatements: StatementStructures[] = [];
                    if (anyRequestExtends || anyReadonlyProperties || anyRequestProperties) {
                        moduleStatements.push({
                            kind: StructureKind.Interface,
                            name: "Request",
                            isExported: true,
                            extends: requestExtends.map((e) => getTextOfTsNode(e)),
                            properties: requestProperties.map((p) => p.requestProperty ?? p.property)
                        });
                    }
                    if (anyResponseExtends || anyWriteonlyProperties || anyResponseProperties) {
                        moduleStatements.push({
                            kind: StructureKind.Interface,
                            name: "Response",
                            isExported: true,
                            extends: responseExtends.map((e) => getTextOfTsNode(e)),
                            properties: responseProperties.map((p) => p.responseProperty ?? p.property)
                        });
                    }

                    statements.push({
                        kind: StructureKind.Module,
                        name: interface_.name,
                        isExported: true,
                        statements: moduleStatements
                    });
                }
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

    private getBaseInterface(context: Context): {
        normal: InterfaceDeclarationStructure;
        request: InterfaceDeclarationStructure | undefined;
        response: InterfaceDeclarationStructure | undefined;
    } {
        const properties = this.baseProperties.map((p) => {
            const type = context.type.getReferenceToType(p.valueType);
            const property = {
                name: getPropertyKey(this._getBasePropertyKey(p)),
                docs: p.docs != null ? [p.docs] : undefined,
                type: getTextOfTsNode(this.noOptionalProperties ? type.typeNode : type.typeNodeWithoutUndefined),
                hasQuestionToken: !this.noOptionalProperties && type.isOptional
            };
            return {
                property,
                requestProperty: type.requestTypeNode
                    ? {
                          ...property,
                          type: getTextOfTsNode(
                              this.noOptionalProperties
                                  ? type.requestTypeNode
                                  : (type.requestTypeNodeWithoutUndefined as ts.TypeNode)
                          )
                      }
                    : undefined,
                responseProperty: type.responseTypeNode
                    ? {
                          ...property,
                          type: getTextOfTsNode(
                              this.noOptionalProperties
                                  ? type.responseTypeNode
                                  : (type.responseTypeNodeWithoutUndefined as ts.TypeNode)
                          )
                      }
                    : undefined
            };
        });
        const baseExtends = (this.shape?.extends ?? []).map((shapeExtend) => {
            const ref = context.type.getReferenceToType(context.type.typeNameToTypeReference(shapeExtend));
            return {
                normal: ref.typeNode,
                request: ref.requestTypeNode,
                response: ref.responseTypeNode
            };
        });

        const normal: InterfaceDeclarationStructure = {
            kind: StructureKind.Interface,
            name: GeneratedUnionImpl.BASE_INTERFACE_NAME,
            extends: baseExtends.map((ext) => getTextOfTsNode(ext.normal)),
            properties: properties.map((p) => p.property),
            isExported: true
        };
        if (!this.generateReadWriteOnlyTypes) {
            return {
                normal,
                request: undefined,
                response: undefined
            };
        }
        const anyRequestProps = properties.some((p) => p.requestProperty != null);
        const anyResponseProps = properties.some((p) => p.responseProperty != null);
        const anyRequestExtends = baseExtends.some((ext) => ext.request != null);
        const anyResponseExtends = baseExtends.some((ext) => ext.response != null);

        return {
            normal,
            request:
                anyRequestProps || anyRequestExtends
                    ? {
                          ...normal,
                          name: "Request",
                          extends: baseExtends.map((ext) => getTextOfTsNode(ext.request ?? ext.normal)),
                          properties: properties.map((p) => p.requestProperty ?? p.property)
                      }
                    : undefined,
            response:
                anyResponseProps || anyResponseExtends
                    ? {
                          ...normal,
                          name: "Response",
                          extends: baseExtends.map((ext) => getTextOfTsNode(ext.response ?? ext.normal)),
                          properties: properties.map((p) => p.responseProperty ?? p.property)
                      }
                    : undefined
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
                    name: getPropertyKey(singleUnionType.getVisitorKey()),
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
                                            this.unknownSingleUnionType.invokeVisitMethod({
                                                localReferenceToUnionValue: ts.factory.createIdentifier(
                                                    GeneratedUnionImpl.VISITEE_PARAMETER_NAME
                                                ),
                                                localReferenceToVisitor: ts.factory.createIdentifier(
                                                    GeneratedUnionImpl.VISITOR_PARAMETER_NAME
                                                )
                                            })
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

    private getTypeAliasesForNamingConflicts(context: Context): TypeAliasDeclarationStructure[] {
        const aliases: TypeAliasDeclarationStructure[] = [];
        for (const parsedSingleUnionType of this.parsedSingleUnionTypes) {
            // Access the underlying SingleUnionTypeGenerator through the protected property
            const generator = (parsedSingleUnionType as any).singleUnionType;
            if (generator?.getTypeAliasForNamingConflict) {
                const aliasInfo = generator.getTypeAliasForNamingConflict(context);
                if (aliasInfo) {
                    aliases.push({
                        kind: StructureKind.TypeAlias,
                        name: aliasInfo.name,
                        type: aliasInfo.type,
                        isExported: false
                    });
                }
            }
        }
        return aliases;
    }

    private hasBaseInterface(): boolean {
        return this.baseProperties.length > 0 || (this.shape?.extends ?? []).length > 0;
    }

    private hasBaseInterfaces(context: Context): {
        normal: boolean;
        request: boolean;
        response: boolean;
    } {
        const hasNormal = this.baseProperties.length > 0 || (this.shape?.extends ?? []).length > 0;
        if (!this.generateReadWriteOnlyTypes) {
            return {
                normal: hasNormal,
                request: false,
                response: false
            };
        }

        let hasRequest = false;
        let hasResponse = false;
        if (hasNormal && this.shape) {
            const properties = this.baseProperties.map((p) => {
                const type = context.type.getReferenceToType(p.valueType);
                return {
                    requestProperty: type.requestTypeNode ? true : false,
                    responseProperty: type.responseTypeNode ? true : false
                };
            });
            const baseExtends = (this.shape?.extends ?? []).map((shapeExtend) => {
                const ref = context.type.getReferenceToType(context.type.typeNameToTypeReference(shapeExtend));
                return {
                    request: ref.requestTypeNode ? true : false,
                    response: ref.responseTypeNode ? true : false
                };
            });
            hasRequest = properties.some((p) => p.requestProperty) || baseExtends.some((ext) => ext.request);
            hasResponse = properties.some((p) => p.responseProperty) || baseExtends.some((ext) => ext.response);
        }
        return {
            normal: hasNormal,
            request: hasRequest,
            response: hasResponse
        };
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
