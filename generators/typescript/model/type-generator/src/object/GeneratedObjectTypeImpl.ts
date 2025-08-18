import { ExampleTypeShape, ObjectProperty, ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";
import {
    GetReferenceOpts,
    generateInlinePropertiesModule,
    getPropertyKey,
    getTextOfTsNode,
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
    isWriteOnly: boolean;
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
                    ts.factory.createIdentifier(getPropertyKey(name)),
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
                name: getPropertyKey(name),
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
                name: getPropertyKey(this.getPropertyKeyFromProperty(property)),
                type: this.noOptionalProperties ? value.typeNode : value.typeNodeWithoutUndefined,
                hasQuestionToken: !this.noOptionalProperties && value.isOptional,
                docs: property.docs,
                irProperty: property,
                isReadonly: property.propertyAccess === "READ_ONLY",
                isWriteOnly: property.propertyAccess === "WRITE_ONLY",
                requestType: this.noOptionalProperties ? value.requestTypeNode : value.requestTypeNodeWithoutUndefined,
                responseType: this.noOptionalProperties
                    ? value.responseTypeNode
                    : value.responseTypeNodeWithoutUndefined
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
                isWriteOnly: false,
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
                    getPropertyKey(propertyKey),
                    context.type.getGeneratedExample(property.value).build(context, opts)
                );
            }
            if (originalTypeForProperty.type !== "object") {
                throw new Error("Property does not come from an object");
            }
            const key = originalTypeForProperty.getPropertyKey({ propertyWireKey: property.name.wireValue });
            return ts.factory.createPropertyAssignment(
                getPropertyKey(key),
                context.type.getGeneratedExample(property.value).build(context, opts)
            );
        });
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
        if (!this.enableInlineTypes) {
            return undefined;
        }

        const requestResponseStatements = this.generateRequestResponseModuleStatements(context);

        const inlineTypeStatements = this.generateInlineTypeModuleStatements(context);

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
        if (!this.generateReadonlyWriteonlyTypes) {
            return [];
        }

        const properties = this.generatePropertiesInternal(context);
        const propertiesToOmitFromResponse = properties
            .filter((prop) => prop.isWriteOnly || prop.responseType)
            .map((prop) => prop.name);
        const propertiesToOmitFromRequest = properties
            .filter((prop) => prop.isReadonly || prop.requestType)
            .map((prop) => prop.name);
        const needsRequestTypeVariants = properties.filter((prop) => prop.requestType);
        const needsResponseTypeVariants = properties.filter((prop) => prop.responseType);

        const statements: (string | WriterFunction | StatementStructures)[] = [];
        const requestTypeIntersections: ts.TypeNode[] = [];
        if (propertiesToOmitFromRequest.length > 0) {
            requestTypeIntersections.push(
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(this.typeName), undefined),
                    ts.factory.createUnionTypeNode(
                        propertiesToOmitFromRequest.map((prop) =>
                            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(prop))
                        )
                    )
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
        if (propertiesToOmitFromResponse.length > 0) {
            responseTypeIntersections.push(
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(this.typeName), undefined),
                    ts.factory.createUnionTypeNode(
                        propertiesToOmitFromResponse.map((prop) =>
                            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(prop))
                        )
                    )
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
