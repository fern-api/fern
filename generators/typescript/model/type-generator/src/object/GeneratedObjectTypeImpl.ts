import {
    ExampleTypeShape,
    ObjectProperty,
    ObjectPropertyAccess,
    ObjectTypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import {
    GetReferenceOpts,
    generateInlinePropertiesModule,
    getPropertyKey,
    getTextOfTsNode,
    isExpressionUndefined,
    maybeAddDocsStructure,
    TypeReferenceNode
} from "@fern-typescript/commons";
import { BaseContext, GeneratedObjectType } from "@fern-typescript/contexts";
import {
    InterfaceDeclarationStructure,
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    PropertySignatureStructure,
    StatementStructures,
    StructureKind,
    ts,
    WriterFunction
} from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

interface Property {
    name: string;
    type: ts.TypeNode;
    requestType: ts.TypeNode | undefined;
    responseType: ts.TypeNode | undefined;
    hasQuestionToken: boolean;
    docs: string | undefined;
    irProperty: ObjectProperty | undefined;
    isReadonly: boolean;
    isWriteonly: boolean;
}

export class GeneratedObjectTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<ObjectTypeDeclaration, Context>
    implements GeneratedObjectType<Context>
{
    private readonly allObjectProperties: ObjectProperty[];
    public readonly type = "object";
    constructor(init: AbstractGeneratedType.Init<ObjectTypeDeclaration, Context>) {
        super(init);
        this.allObjectProperties = [...this.shape.properties, ...(this.shape.extendedProperties ?? [])];
    }

    /**
     * Unwraps parenthesized type nodes to get to the underlying type.
     */
    private unwrapParens(node: ts.TypeNode): ts.TypeNode {
        let current = node;
        while (ts.isParenthesizedTypeNode(current)) {
            current = current.type;
        }
        return current;
    }

    /**
     * Checks if a type node is the undefined keyword.
     */
    private isUndefinedKeyword(node: ts.TypeNode): boolean {
        const unwrapped = this.unwrapParens(node);
        return unwrapped.kind === ts.SyntaxKind.UndefinedKeyword;
    }

    /**
     * Strips top-level undefined from a union type node.
     * This prevents double unions like (T | undefined) | undefined.
     */
    private stripTopLevelUndefined(node: ts.TypeNode): ts.TypeNode {
        const unwrapped = this.unwrapParens(node);
        if (ts.isUnionTypeNode(unwrapped)) {
            const nonUndefined = unwrapped.types.filter((t) => !this.isUndefinedKeyword(t));
            switch (nonUndefined.length) {
                case 0:
                    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
                case 1: {
                    const only = nonUndefined[0];
                    if (only == null) {
                        // Defensive fallback; should be unreachable given length === 1
                        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
                    }
                    return only;
                }
                default:
                    return ts.factory.createUnionTypeNode(nonUndefined);
            }
        }
        return node;
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const statements: (string | WriterFunction | StatementStructures)[] = [this.generateInterface(context)];
        const iModule = this.generateModule(context);
        if (iModule) {
            statements.push(iModule);
        }
        return statements;
    }

    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        return {
            typeNode: ts.factory.createTypeLiteralNode(
                this.generatePropertiesInternal(context).map(({ name, type, hasQuestionToken, docs, irProperty }) => {
                    let propertyValue: ts.TypeNode = type;
                    if (irProperty) {
                        const inlineUnionRef = context.type.getReferenceToTypeForInlineUnion(irProperty.valueType);
                        const shouldIncludeUndefined = hasQuestionToken && !this.includeSerdeLayer;
                        const baseType = this.stripTopLevelUndefined(inlineUnionRef.typeNodeWithoutUndefined);
                        propertyValue = hasQuestionToken
                            ? shouldIncludeUndefined
                                ? ts.factory.createUnionTypeNode([
                                      baseType,
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                  ])
                                : baseType
                            : baseType;
                    }
                    return ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier(getPropertyKey(name)),
                        hasQuestionToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                        propertyValue
                    );
                })
            ),
            requestTypeNode: this.generateReadWriteOnlyTypes
                ? ts.factory.createTypeLiteralNode(
                      this.generatePropertiesInternal(context)
                          .filter(({ isReadonly }) => !isReadonly)
                          .map(({ name, type, requestType, hasQuestionToken, irProperty }) => {
                              let propertyValue: ts.TypeNode = requestType ?? type;
                              if (irProperty) {
                                  const inlineUnionRef = context.type.getReferenceToTypeForInlineUnion(
                                      irProperty.valueType
                                  );
                                  const shouldIncludeUndefined = hasQuestionToken && !this.includeSerdeLayer;
                                  const baseTypeCandidate =
                                      inlineUnionRef.requestTypeNodeWithoutUndefined ??
                                      inlineUnionRef.typeNodeWithoutUndefined;
                                  const baseType = this.stripTopLevelUndefined(baseTypeCandidate);
                                  propertyValue = hasQuestionToken
                                      ? shouldIncludeUndefined
                                          ? ts.factory.createUnionTypeNode([
                                                baseType,
                                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                            ])
                                          : baseType
                                      : baseType;
                              }
                              return ts.factory.createPropertySignature(
                                  undefined,
                                  ts.factory.createIdentifier(getPropertyKey(name)),
                                  hasQuestionToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                                  propertyValue
                              );
                          })
                  )
                : undefined,
            responseTypeNode: this.generateReadWriteOnlyTypes
                ? ts.factory.createTypeLiteralNode(
                      this.generatePropertiesInternal(context)
                          .filter(({ isWriteonly }) => !isWriteonly)
                          .map(({ name, type, responseType, hasQuestionToken, irProperty }) => {
                              let propertyValue: ts.TypeNode = responseType ?? type;
                              if (irProperty) {
                                  const inlineUnionRef = context.type.getReferenceToTypeForInlineUnion(
                                      irProperty.valueType
                                  );
                                  const shouldIncludeUndefined = hasQuestionToken && !this.includeSerdeLayer;
                                  const baseTypeCandidate =
                                      inlineUnionRef.responseTypeNodeWithoutUndefined ??
                                      inlineUnionRef.typeNodeWithoutUndefined;
                                  const baseType = this.stripTopLevelUndefined(baseTypeCandidate);
                                  propertyValue = hasQuestionToken
                                      ? shouldIncludeUndefined
                                          ? ts.factory.createUnionTypeNode([
                                                baseType,
                                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                            ])
                                          : baseType
                                      : baseType;
                              }
                              return ts.factory.createPropertySignature(
                                  undefined,
                                  ts.factory.createIdentifier(getPropertyKey(name)),
                                  hasQuestionToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                                  propertyValue
                              );
                          })
                  )
                : undefined
        };
    }

    public generateProperties(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
        return this.generatePropertiesInternal(context).map(
            ({ name, type, requestType, responseType, hasQuestionToken, docs, isReadonly, isWriteonly }) => {
                const property: PropertySignatureStructure = {
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(name),
                    type: getTextOfTsNode(type),
                    hasQuestionToken,
                    docs: docs != null ? [{ description: docs }] : undefined
                };
                return {
                    property,
                    requestProperty: requestType
                        ? ({
                              ...property,
                              type: getTextOfTsNode(requestType)
                          } as PropertySignatureStructure)
                        : undefined,
                    responseProperty: responseType
                        ? ({
                              ...property,
                              type: getTextOfTsNode(responseType)
                          } as PropertySignatureStructure)
                        : undefined,
                    isReadonly,
                    isWriteonly
                };
            }
        );
    }

    private generatePropertiesInternal(context: Context): Property[] {
        const props = this.shape.properties.map((property) => {
            const value = this.getTypeForObjectProperty(context, property);

            const shouldIncludeUndefined = value.isOptional && !this.includeSerdeLayer;
            const undefinedKw = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);

            const baseType = this.stripTopLevelUndefined(value.typeNodeWithoutUndefined);
            const typeNodeToUse = this.noOptionalProperties
                ? value.typeNode
                : shouldIncludeUndefined
                  ? ts.factory.createUnionTypeNode([baseType, undefinedKw])
                  : baseType;

            const baseReqCandidate = value.requestTypeNodeWithoutUndefined ?? value.typeNodeWithoutUndefined;
            const baseReq = this.stripTopLevelUndefined(baseReqCandidate);
            const requestTypeNodeToUse = this.noOptionalProperties
                ? value.requestTypeNode
                : shouldIncludeUndefined
                  ? ts.factory.createUnionTypeNode([baseReq, undefinedKw])
                  : baseReq;

            const baseRespCandidate = value.responseTypeNodeWithoutUndefined ?? value.typeNodeWithoutUndefined;
            const baseResp = this.stripTopLevelUndefined(baseRespCandidate);
            const responseTypeNodeToUse = this.noOptionalProperties
                ? value.responseTypeNode
                : shouldIncludeUndefined
                  ? ts.factory.createUnionTypeNode([baseResp, undefinedKw])
                  : baseResp;

            const propertyNode: Property = {
                name: getPropertyKey(this.getPropertyKeyFromProperty(property)),
                type: typeNodeToUse,
                hasQuestionToken: !this.noOptionalProperties && value.isOptional,
                docs: property.docs,
                irProperty: property,
                isReadonly: this.generateReadWriteOnlyTypes ? property.propertyAccess === "READ_ONLY" : false,
                isWriteonly: this.generateReadWriteOnlyTypes ? property.propertyAccess === "WRITE_ONLY" : false,
                requestType: this.generateReadWriteOnlyTypes ? requestTypeNodeToUse : undefined,
                responseType: this.generateReadWriteOnlyTypes ? responseTypeNodeToUse : undefined
            };
            return propertyNode;
        });
        if (this.shape.extraProperties) {
            props.push({
                name: "[key: string]", // This is the simpler way to add an index signature
                type: ts.factory.createTypeReferenceNode("any"),
                hasQuestionToken: false,
                docs: "Accepts any additional properties",
                irProperty: undefined,
                isReadonly: false,
                isWriteonly: false,
                requestType: undefined,
                responseType: undefined
            });
        }
        return props;
    }

    public generateInterface(context: Context): InterfaceDeclarationStructure {
        const interfaceNode: InterfaceDeclarationStructure = {
            kind: StructureKind.Interface,
            name: this.typeName,
            properties: [...this.generateProperties(context).map((p) => p.property)],
            isExported: true
        };

        maybeAddDocsStructure(interfaceNode, this.getDocs({ context }));
        const iExtends = [];
        for (const extension of this.shape.extends) {
            iExtends.push(getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode()));
        }
        interfaceNode.extends = iExtends;
        return interfaceNode;
    }

    private getTypeForObjectProperty(context: Context, property: ObjectProperty): TypeReferenceNode {
        return context.type.getReferenceToInlinePropertyType(
            property.valueType,
            this.typeName,
            property.name.name.pascalCase.safeName
        );
    }

    public getPropertyKey({ propertyWireKey }: { propertyWireKey: string }): string {
        const property = this.allObjectProperties.find((property) => property.name.wireValue === propertyWireKey);
        if (property == null) {
            throw new Error("Property does not exist: " + propertyWireKey);
        }
        return this.getPropertyKeyFromProperty(property);
    }

    private getPropertyKeyFromProperty(property: ObjectProperty): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return property.name.name.camelCase.unsafeName;
        } else {
            return property.name.wireValue;
        }
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "object") {
            throw new Error("Example is not for an object");
        }

        return ts.factory.createObjectLiteralExpression(this.buildExampleProperties(example, context, opts), true);
    }

    public buildExampleProperties(
        example: ExampleTypeShape,
        context: Context,
        opts: GetReferenceOpts
    ): ts.ObjectLiteralElementLike[] {
        if (example.type !== "object") {
            throw new Error("Example is not for an object");
        }

        const filterOutReadonlyProps = this.generateReadWriteOnlyTypes && opts.isForRequest === true;
        const filterOutWriteonlyProps = this.generateReadWriteOnlyTypes && opts.isForResponse === true;

        return [
            ...example.properties
                .filter((property) => {
                    if (typeof property.propertyAccess === "undefined") {
                        return true;
                    }
                    if (filterOutReadonlyProps && property.propertyAccess === ObjectPropertyAccess.ReadOnly) {
                        return false;
                    }
                    if (filterOutWriteonlyProps && property.propertyAccess === ObjectPropertyAccess.WriteOnly) {
                        return false;
                    }
                    return true;
                })
                .map((property) => {
                    const originalTypeForProperty = context.type.getGeneratedType(property.originalTypeDeclaration);
                    if (originalTypeForProperty.type === "union") {
                        const propertyKey = originalTypeForProperty.getSinglePropertyKey({
                            name: property.name,
                            type: TypeReference.named({
                                ...property.originalTypeDeclaration,
                                default: undefined,
                                inline: undefined
                            })
                        });
                        const value = context.type.getGeneratedExample(property.value).build(context, opts);
                        if (!this.noOptionalProperties && isExpressionUndefined(value)) {
                            return undefined;
                        }
                        return ts.factory.createPropertyAssignment(getPropertyKey(propertyKey), value);
                    }
                    if (originalTypeForProperty.type !== "object") {
                        throw new Error("Property does not come from an object");
                    }
                    try {
                        const key = originalTypeForProperty.getPropertyKey({
                            propertyWireKey: property.name.wireValue
                        });
                        const value = context.type.getGeneratedExample(property.value).build(context, opts);
                        if (!this.noOptionalProperties && isExpressionUndefined(value)) {
                            return undefined;
                        }
                        return ts.factory.createPropertyAssignment(getPropertyKey(key), value);
                    } catch (e) {
                        context.logger.debug(
                            `Failed to get property key for property with wire value '${property.name.wireValue}' in object example. ` +
                                `This may indicate a mismatch between the example and the type definition.`
                        );
                        return undefined;
                    }
                })
                .filter((property) => property != null),
            ...(example.extraProperties ?? [])
                .map((property) => {
                    const value = context.type.getGeneratedExample(property.value).build(context, opts);
                    if (isExpressionUndefined(value)) {
                        return undefined;
                    }
                    return ts.factory.createPropertyAssignment(getPropertyKey(property.name.wireValue), value);
                })
                .filter((property) => typeof property !== "undefined")
        ];
    }

    public getAllPropertiesIncludingExtensions(
        context: Context,
        { forceCamelCase }: { forceCamelCase?: boolean } = { forceCamelCase: false }
    ): { propertyKey: string; wireKey: string; type: TypeReference }[] {
        return [
            ...this.shape.properties.map((property) => ({
                wireKey: property.name.wireValue,
                propertyKey: forceCamelCase
                    ? property.name.name.camelCase.safeName
                    : this.getPropertyKeyFromProperty(property),
                type: property.valueType
            })),
            ...this.shape.extends.flatMap((extension) => {
                const generatedType = context.type.getGeneratedType(extension);
                if (generatedType.type !== "object") {
                    throw new Error("Type extends non-object");
                }
                return generatedType.getAllPropertiesIncludingExtensions(context);
            })
        ];
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        const inlineTypeStatements = this.generateInlineTypeModuleStatements(context);
        const requestResponseStatements = this.generateRequestResponseModuleStatements(context);

        const moduleStatements = [...inlineTypeStatements, ...requestResponseStatements];
        if (moduleStatements.length === 0) {
            return undefined;
        }
        const module: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false,
            declarationKind: ModuleDeclarationKind.Namespace,
            statements: moduleStatements
        };
        return module;
    }

    private generateRequestResponseModuleStatements(
        context: Context
    ): (string | WriterFunction | StatementStructures)[] {
        if (!this.generateReadWriteOnlyTypes) {
            return [];
        }

        const properties = this.generatePropertiesInternal(context);
        const propertiesToOmitFromResponse = properties
            .filter((prop) => prop.isWriteonly || prop.responseType)
            .map((prop) => prop.name);
        const propertiesToOmitFromRequest = properties
            .filter((prop) => prop.isReadonly || prop.requestType)
            .map((prop) => prop.name);
        const extendsTypeReferences = this.shape.extends.map((e) => {
            const ref = context.type.getReferenceToType(context.type.typeNameToTypeReference(e));
            return {
                typeNode: ref.typeNode,
                requestTypeNode: ref.requestTypeNode,
                responseTypeNode: ref.responseTypeNode
            };
        });
        const extendsToRewriteRequest = extendsTypeReferences.filter((e) => e.requestTypeNode);
        const extendsToRewriteResponse = extendsTypeReferences.filter((e) => e.responseTypeNode);
        const needsRequestTypeVariants = properties.filter((prop) => prop.requestType);
        const needsResponseTypeVariants = properties.filter((prop) => prop.responseType);

        const statements: (string | WriterFunction | StatementStructures)[] = [];
        const requestTypeIntersections: ts.TypeNode[] = [];
        if (propertiesToOmitFromRequest.length > 0 || extendsToRewriteRequest.length > 0) {
            requestTypeIntersections.push(
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(this.typeName), undefined),
                    ts.factory.createUnionTypeNode([
                        ...propertiesToOmitFromRequest.map((prop) =>
                            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(prop))
                        ),
                        ...extendsToRewriteRequest.map((e) =>
                            ts.factory.createTypeOperatorNode(ts.SyntaxKind.KeyOfKeyword, e.typeNode)
                        )
                    ])
                ])
            );
        }

        if (needsRequestTypeVariants.length > 0) {
            requestTypeIntersections.push(
                ts.factory.createTypeLiteralNode(
                    needsRequestTypeVariants.map((prop) => {
                        return ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(prop.name),
                            undefined,
                            prop.requestType
                        );
                    })
                )
            );
        }

        requestTypeIntersections.push(
            ...extendsToRewriteRequest
                .filter((e) => e.requestTypeNode != null)
                .map((e) => e.requestTypeNode as ts.TypeNode)
        );

        if (requestTypeIntersections.length > 0) {
            statements.push(
                getTextOfTsNode(
                    ts.factory.createTypeAliasDeclaration(
                        undefined,
                        [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
                        ts.factory.createIdentifier("Request"),
                        undefined,
                        requestTypeIntersections.length === 1
                            ? (requestTypeIntersections[0] as ts.TypeNode)
                            : ts.factory.createIntersectionTypeNode(requestTypeIntersections)
                    )
                )
            );
        }

        const responseTypeIntersections: ts.TypeNode[] = [];
        if (propertiesToOmitFromResponse.length > 0 || extendsToRewriteResponse.length > 0) {
            responseTypeIntersections.push(
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(this.typeName), undefined),
                    ts.factory.createUnionTypeNode([
                        ...propertiesToOmitFromResponse.map((prop) =>
                            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(prop))
                        ),
                        ...extendsToRewriteResponse.map((e) =>
                            ts.factory.createTypeOperatorNode(ts.SyntaxKind.KeyOfKeyword, e.typeNode)
                        )
                    ])
                ])
            );
        }

        if (needsResponseTypeVariants.length > 0) {
            responseTypeIntersections.push(
                ts.factory.createTypeLiteralNode(
                    needsResponseTypeVariants.map((prop) => {
                        return ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(prop.name),
                            undefined,
                            prop.responseType
                        );
                    })
                )
            );
        }

        responseTypeIntersections.push(
            ...extendsToRewriteResponse
                .filter((e) => e.responseTypeNode != null)
                .map((e) => e.responseTypeNode as ts.TypeNode)
        );

        if (responseTypeIntersections.length > 0) {
            statements.push(
                getTextOfTsNode(
                    ts.factory.createTypeAliasDeclaration(
                        undefined,
                        [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
                        ts.factory.createIdentifier("Response"),
                        undefined,
                        responseTypeIntersections.length === 1
                            ? (responseTypeIntersections[0] as ts.TypeNode)
                            : ts.factory.createIntersectionTypeNode(responseTypeIntersections)
                    )
                )
            );
        }

        return statements;
    }

    private generateInlineTypeModuleStatements(context: Context): (string | WriterFunction | StatementStructures)[] {
        if (!this.enableInlineTypes) {
            return [];
        }
        return generateInlinePropertiesModule({
            properties: this.shape.properties.map((prop) => ({
                propertyName: prop.name.name.pascalCase.safeName,
                typeReference: prop.valueType
            })),
            generateStatements: (typeName, typeNameOverride) =>
                context.type.getGeneratedType(typeName, typeNameOverride).generateStatements(context),
            getTypeDeclaration: (namedType) => context.type.getTypeDeclaration(namedType)
        });
    }
}
