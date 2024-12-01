import {
    ExampleTypeShape,
    NamedType,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, maybeAddDocs, TypeReferenceNode } from "@fern-typescript/commons";
import { GeneratedObjectType, ModelContext } from "@fern-typescript/contexts";
import {
    InterfaceDeclarationStructure,
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    StatementStructures,
    StructureKind,
    ts,
    WriterFunction
} from "ts-morph";
import { assertNever } from "@fern-api/core-utils";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedObjectTypeImpl<Context extends ModelContext>
    extends AbstractGeneratedType<ObjectTypeDeclaration, Context>
    implements GeneratedObjectType<Context>
{
    public readonly type = "object";

    public writeToFile(context: Context): void {
        context.sourceFile.addInterface(this.generateInterface(context));
        const inlineTypesModule = this.generateModuleForInlineTypes(context);
        if (inlineTypesModule) {
            context.sourceFile.addModule(inlineTypesModule);
        }
    }

    public generateStatements(
        context: Context
    ): string | WriterFunction | readonly (string | WriterFunction | StatementStructures)[] {
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
        return {
            interface_: this.generateInterface(context),
            inlineModule: this.generateModuleForInlineTypes(context)
        };
    }

    private getPropertyStructures(context: Context): OptionalKind<PropertySignatureStructure>[] {
        return this.shape.properties.map((property) => {
            const value = this.getTypeForObjectProperty(context, property);
            const propertyNode: OptionalKind<PropertySignatureStructure> = {
                name: `"${this.getPropertyKeyFromProperty(property)}"`,
                type: getTextOfTsNode(this.noOptionalProperties ? value.typeNode : value.typeNodeWithoutUndefined),
                hasQuestionToken: !this.noOptionalProperties && value.isOptional,
                docs: property.docs != null ? [{ description: property.docs }] : undefined
            };

            return propertyNode;
        });
    }

    private generateInterface(context: Context): InterfaceDeclarationStructure {
        const interfaceNode: InterfaceDeclarationStructure = {
            kind: StructureKind.Interface,
            name: this.typeName,
            properties: [...this.getPropertyStructures(context)],
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

    private getTypeForObjectProperty(context: Context, property: ObjectProperty): TypeReferenceNode {
        const inlineProps = this.getInlinePropertiesWithTypeDeclaration(context);
        if (inlineProps.has(property)) {
            return {
                isOptional: false,
                typeNode: ts.factory.createTypeReferenceNode(
                    `${this.typeName}.${property.name.name.pascalCase.safeName}`
                ),
                typeNodeWithoutUndefined: ts.factory.createTypeReferenceNode(
                    `${this.typeName}.${property.name.name.pascalCase.safeName}`
                )
            };
        } else {
            return context.type.getReferenceToType(property.valueType);
        }
    }

    private getInlinePropertiesWithTypeDeclaration(context: Context): Map<ObjectProperty, TypeDeclaration> {
        const inlineProperties = new Map<ObjectProperty, TypeDeclaration>(
            this.shape.properties
                .map((property) => {
                    switch (property.valueType.type) {
                        case "named":
                            return [property, property.valueType];
                        case "container":
                            if (
                                property.valueType.container.type === "optional" &&
                                property.valueType.container.optional.type === "named"
                            ) {
                                return [property, property.valueType.container.optional];
                            }
                            return undefined;
                        case "primitive":
                            return undefined;
                        case "unknown":
                            return undefined;
                        default:
                            assertNever(property.valueType);
                    }
                })
                .filter((x): x is [ObjectProperty, TypeReference.Named] => x != null)
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

    private generateModuleForInlineTypes(context: Context): ModuleDeclarationStructure | undefined {
        const inlineProperties = this.getInlinePropertiesWithTypeDeclaration(context);
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
                    const generatedType = context.type.getGeneratedType(
                        typeDeclaration.name,
                        objectProperty.name.name.pascalCase.safeName
                    );
                    return generatedType.generateStatements(context);
                }
            )
        };
    }
}
