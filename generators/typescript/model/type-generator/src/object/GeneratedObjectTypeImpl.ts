import {
    GetReferenceOpts,
    TypeReferenceNode,
    generateInlinePropertiesModule,
    getTextOfTsNode,
    maybeAddDocsStructure
} from "@fern-typescript/commons";
import { BaseContext, GeneratedObjectType } from "@fern-typescript/contexts";
import {
    InterfaceDeclarationStructure,
    ModuleDeclarationStructure,
    PropertySignatureStructure,
    StatementStructures,
    StructureKind,
    WriterFunction,
    ts
} from "ts-morph";

import { ExampleTypeShape, ObjectProperty, ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedType } from "../AbstractGeneratedType";

interface Property {
    name: string;
    type: ts.TypeNode;
    hasQuestionToken: boolean;
    docs: string | undefined;
    irProperty: ObjectProperty | undefined;
}

export class GeneratedObjectTypeImpl<Context extends BaseContext>
    extends AbstractGeneratedType<ObjectTypeDeclaration, Context>
    implements GeneratedObjectType<Context>
{
    public readonly type = "object";

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

    public generateForInlineUnion(context: Context): ts.TypeNode {
        return ts.factory.createTypeLiteralNode(
            this.generatePropertiesInternal(context).map(({ name, type, hasQuestionToken, docs, irProperty }) => {
                let propertyValue: ts.TypeNode = type;
                if (irProperty) {
                    const inlineUnionRef = context.type.getReferenceToTypeForInlineUnion(irProperty.valueType);
                    propertyValue = hasQuestionToken
                        ? inlineUnionRef.typeNode
                        : inlineUnionRef.typeNodeWithoutUndefined;
                }
                return ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier(name),
                    hasQuestionToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    propertyValue
                );
            })
        );
    }

    public generateProperties(context: Context): PropertySignatureStructure[] {
        return this.generatePropertiesInternal(context).map(({ name, type, hasQuestionToken, docs }) => {
            const propertyNode: PropertySignatureStructure = {
                kind: StructureKind.PropertySignature,
                name,
                type: getTextOfTsNode(type),
                hasQuestionToken,
                docs: docs != null ? [{ description: docs }] : undefined
            };

            return propertyNode;
        });
    }

    private generatePropertiesInternal(context: Context): Property[] {
        const props = this.shape.properties.map((property) => {
            const value = this.getTypeForObjectProperty(context, property);
            const propertyNode: Property = {
                name: `"${this.getPropertyKeyFromProperty(property)}"`,
                type: this.noOptionalProperties ? value.typeNode : value.typeNodeWithoutUndefined,
                hasQuestionToken: !this.noOptionalProperties && value.isOptional,
                docs: property.docs,
                irProperty: property
            };
            return propertyNode;
        });
        if (this.shape.extraProperties) {
            props.push({
                name: "[key: string]", // This is the simpler way to add an index signature
                type: ts.factory.createTypeReferenceNode("any"),
                hasQuestionToken: false,
                docs: "Accepts any additional properties",
                irProperty: undefined
            });
        }
        return props;
    }

    public generateInterface(context: Context): InterfaceDeclarationStructure {
        const interfaceNode: InterfaceDeclarationStructure = {
            kind: StructureKind.Interface,
            name: this.typeName,
            properties: [...this.generateProperties(context)],
            isExported: true
        };

        maybeAddDocsStructure(interfaceNode, this.getDocs(context));
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

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        if (!this.enableInlineTypes) {
            return undefined;
        }
        return generateInlinePropertiesModule({
            parentTypeName: this.typeName,
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
