import {
    ExampleTypeShape,
    NamedType,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import {
    GetReferenceOpts,
    getTextOfTsNode,
    maybeAddDocs,
    TypeReferenceNode,
    writerToString
} from "@fern-typescript/commons";
import { BaseContext, GeneratedObjectType, GeneratedType, ModelContext } from "@fern-typescript/contexts";
import {
    InterfaceDeclarationStructure,
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    StatementStructures,
    StructureKind,
    ts,
    TypeAliasDeclarationStructure,
    TypeLiteralNode,
    WriterFunction
} from "ts-morph";
import { assertNever } from "@fern-api/core-utils";
import { AbstractGeneratedType } from "../AbstractGeneratedType";
import { renameTypeReferenceNode } from "../utils/renameTypeReferenceNode";

type InlinePropertyMap = Map<ObjectProperty, TypeDeclaration>;

export class GeneratedObjectTypeImpl<Context extends ModelContext>
    extends AbstractGeneratedType<ObjectTypeDeclaration, Context>
    implements GeneratedObjectType<Context>
{
    public readonly type = "object";

    public writeToFile(context: Context): void {
        context.sourceFile.addStatements(this.generateStatements(context));
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | (string | WriterFunction | StatementStructures)[] {
        const { interface_, inlineModule } = this.getNamedStructures(context);
        const statements: (string | WriterFunction | StatementStructures)[] = [interface_];
        if (inlineModule) {
            statements.push(inlineModule);
        }
        return statements;
    }

    public getNamedStructures(context: Context): {
        interface_: InterfaceDeclarationStructure;
        inlineModule: ModuleDeclarationStructure | undefined;
    } {
        const inlineProperties = this.getInlinePropertiesWithTypeDeclaration(context);
        return {
            interface_: this.generateInterface(context, inlineProperties),
            inlineModule: this.generateModuleForInlineTypes(context, inlineProperties)
        };
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        const inlineProperties = this.getInlinePropertiesWithTypeDeclaration(context);
        return ts.factory.createTypeLiteralNode(
            this.shape.properties.map((property) => {
                const value = this.getTypeForObjectProperty(context, property, inlineProperties);
                const hasOptionalToken = !this.noOptionalProperties && value.isOptional;
                let propertyValue: ts.TypeNode;
                if (inlineProperties.has(property)) {
                    const typeDeclaration = inlineProperties.get(property)!;
                    const generatedType = context.type.getGeneratedType(typeDeclaration.name);
                    propertyValue = generatedType.generateForInlineUnion(context);
                } else {
                    propertyValue = ts.factory.createTypeReferenceNode(
                        getTextOfTsNode(this.noOptionalProperties ? value.typeNode : value.typeNodeWithoutUndefined)
                    );
                }
                return ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier(this.getPropertyKeyFromProperty(property)),
                    hasOptionalToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    propertyValue
                );
            })
        );
    }

    private getPropertyStructures(
        context: Context,
        inlineProperties: InlinePropertyMap
    ): OptionalKind<PropertySignatureStructure>[] {
        return this.shape.properties.map((property) => {
            const value = this.getTypeForObjectProperty(context, property, inlineProperties);
            const propertyNode: OptionalKind<PropertySignatureStructure> = {
                name: `"${this.getPropertyKeyFromProperty(property)}"`,
                type: getTextOfTsNode(this.noOptionalProperties ? value.typeNode : value.typeNodeWithoutUndefined),
                hasQuestionToken: !this.noOptionalProperties && value.isOptional,
                docs: property.docs != null ? [{ description: property.docs }] : undefined
            };

            return propertyNode;
        });
    }

    private generateInterface(context: Context, inlineProperties: InlinePropertyMap): InterfaceDeclarationStructure {
        const interfaceNode: InterfaceDeclarationStructure = {
            kind: StructureKind.Interface,
            name: this.typeName,
            properties: [...this.getPropertyStructures(context, inlineProperties)],
            isExported: true
        };

        maybeAddDocs(interfaceNode, this.getDocs(context));
        const iExtends = [];
        for (const extension of this.shape.extends) {
            iExtends.push(getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode()));
        }
        interfaceNode.extends = iExtends;
        return interfaceNode;
    }

    private getTypeForObjectProperty(
        context: Context,
        property: ObjectProperty,
        inlineProperties: InlinePropertyMap
    ): TypeReferenceNode {
        if (inlineProperties.has(property)) {
            const propName = property.name.name.pascalCase.safeName;
            const suffix = generateTypeVisitor(property.valueType, {
                list: () => ".Item",
                map: () => ".Value",
                named: () => "",
                set: () => ".Item",
                other: () => {
                    throw new Error(`Only named, list, map, and set properties can be inlined.
                        Property: ${JSON.stringify(property)}`);
                }
            });
            let typeReference = context.type.getReferenceToType(property.valueType);
            typeReference = {
                isOptional: typeReference.isOptional,
                typeNode: renameTypeReferenceNode(typeReference.typeNode, this.typeName, propName + suffix),
                typeNodeWithoutUndefined: renameTypeReferenceNode(
                    typeReference.typeNode,
                    this.typeName,
                    propName + suffix
                )
            };

            return typeReference;
        } else {
            return context.type.getReferenceToType(property.valueType);
        }
    }

    private getInlinePropertiesWithTypeDeclaration(context: Context): Map<ObjectProperty, TypeDeclaration> {
        const inlineProperties = new Map<ObjectProperty, TypeDeclaration>(
            this.shape.properties
                .map((property): [ObjectProperty, NamedType] | undefined => {
                    const namedType = getNamedType(property.valueType);
                    if (namedType) return [property, namedType];
                    return undefined;
                })
                .filter((x): x is [ObjectProperty, NamedType] => x !== undefined)
                .map(([property, type]): [ObjectProperty, TypeDeclaration] => {
                    return [property, context.type.getTypeDeclaration(type)];
                })
                .filter(([_, type]) => type.inline === true)
        );
        return inlineProperties;
    }

    public getPropertyKey({ propertyWireKey }: { propertyWireKey: string }): string {
        const property = this.shape.properties.find((property) => property.name.wireValue === propertyWireKey);
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

        return example.properties.map((property) => {
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
                return ts.factory.createPropertyAssignment(
                    propertyKey,
                    context.type.getGeneratedExample(property.value).build(context, opts)
                );
            }
            if (originalTypeForProperty.type !== "object") {
                throw new Error("Property does not come from an object");
            }
            const key = originalTypeForProperty.getPropertyKey({ propertyWireKey: property.name.wireValue });
            return ts.factory.createPropertyAssignment(
                key,
                context.type.getGeneratedExample(property.value).build(context, opts)
            );
        });
    }

    public getAllPropertiesIncludingExtensions(
        context: Context
    ): { propertyKey: string; wireKey: string; type: TypeReference }[] {
        return [
            ...this.shape.properties.map((property) => ({
                wireKey: property.name.wireValue,
                propertyKey: this.getPropertyKeyFromProperty(property),
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

    private generateModuleForInlineTypes(
        context: Context,
        inlineProperties: Map<ObjectProperty, TypeDeclaration>
    ): ModuleDeclarationStructure | undefined {
        if (inlineProperties.size === 0) {
            return;
        }
        return {
            kind: StructureKind.Module,
            name: this.typeName,
            isExported: true,
            hasDeclareKeyword: false,
            declarationKind: ModuleDeclarationKind.Namespace,
            statements: Array.from(inlineProperties.entries()).flatMap(
                ([objectProperty, typeDeclaration]: [ObjectProperty, TypeDeclaration]) => {
                    const typeName = objectProperty.name.name.pascalCase.safeName;
                    const listOrMapStatementGenerator = () => {
                        const itemTypeName = "Item";
                        const statements: (string | WriterFunction | StatementStructures)[] = [];
                        const listType: TypeAliasDeclarationStructure = {
                            kind: StructureKind.TypeAlias,
                            name: typeName,
                            type: `${typeName}.${itemTypeName}[]`
                        };
                        statements.push(listType);

                        const generatedType = context.type.getGeneratedType(typeDeclaration.name, itemTypeName);

                        const listModule: ModuleDeclarationStructure = {
                            kind: StructureKind.Module,
                            declarationKind: ModuleDeclarationKind.Namespace,
                            isExported: true,
                            hasDeclareKeyword: false,
                            name: typeName,
                            statements: generatedType.generateStatements(context)
                        };

                        statements.push(listModule);
                        return statements;
                    };
                    return generateTypeVisitor(objectProperty.valueType, {
                        named: () => {
                            const generatedType = context.type.getGeneratedType(typeDeclaration.name, typeName);
                            return generatedType.generateStatements(context);
                        },
                        list: listOrMapStatementGenerator,
                        set: listOrMapStatementGenerator,
                        map: () => {
                            const valueTypeName = "Value";
                            const statements: (string | WriterFunction | StatementStructures)[] = [];
                            const generatedType = context.type.getGeneratedType(typeDeclaration.name, valueTypeName);

                            const mapModule: ModuleDeclarationStructure = {
                                kind: StructureKind.Module,
                                declarationKind: ModuleDeclarationKind.Namespace,
                                isExported: true,
                                hasDeclareKeyword: false,
                                name: typeName,
                                statements: generatedType.generateStatements(context)
                            };

                            statements.push(mapModule);
                            return statements;
                        },
                        other: () => {
                            throw new Error(`Only named, list, map, and set properties can be inlined.
                                Property: ${JSON.stringify(objectProperty)}`);
                        }
                    });
                }
            )
        };
    }
}

function generateTypeVisitor<TOut>(
    typeReference: TypeReference,
    visitor: {
        named: () => TOut;
        list: () => TOut;
        map: () => TOut;
        set: () => TOut;
        other: () => TOut;
    }
): TOut {
    return typeReference._visit({
        named: visitor.named,
        primitive: visitor.other,
        unknown: visitor.other,
        container: (containerType) =>
            containerType._visit({
                list: visitor.list,
                literal: visitor.other,
                map: visitor.map,
                set: visitor.set,
                optional: (typeReference) => generateTypeVisitor(typeReference, visitor),
                _other: visitor.other
            }),
        _other: visitor.other
    });
}

function getNamedType(typeReference: TypeReference): NamedType | undefined {
    switch (typeReference.type) {
        case "named":
            return typeReference;
        case "container":
            switch (typeReference.container.type) {
                case "optional":
                    return getNamedType(typeReference.container.optional);
                case "list":
                    return getNamedType(typeReference.container.list);
                case "map":
                    return getNamedType(typeReference.container.valueType);
                case "set":
                    return getNamedType(typeReference.container.set);
                case "literal":
                    return undefined;
                default:
                    assertNever(typeReference.container);
            }
        case "primitive":
            return undefined;
        case "unknown":
            return undefined;
        default:
            assertNever(typeReference);
    }
}
