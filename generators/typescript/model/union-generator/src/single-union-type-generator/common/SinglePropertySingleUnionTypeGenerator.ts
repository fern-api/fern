import { getPropertyKey, getTextOfTsNode, TypeReferenceNode } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclarationStructure, PropertySignatureStructure, StructureKind, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "../SingleUnionTypeGenerator";

export declare namespace SinglePropertySingleUnionTypeGenerator {
    export interface Init<Context> {
        propertyName: string;
        getTypeName: () => string;
        getReferenceToPropertyType: (context: Context) => TypeReferenceNode;
        getReferenceToPropertyTypeForInlineUnion: (context: Context) => TypeReferenceNode;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
    }
}

export class SinglePropertySingleUnionTypeGenerator<Context extends ModelContext>
    implements SingleUnionTypeGenerator<Context>
{
    private static readonly BUILDER_PARAMETER_NAME = "value";

    private readonly propertyName: string;
    private readonly getReferenceToPropertyType: (context: Context) => TypeReferenceNode;
    private readonly getReferenceToPropertyTypeForInlineUnion: (context: Context) => TypeReferenceNode;
    private readonly noOptionalProperties: boolean;
    private readonly generateReadWriteOnlyTypes: boolean;

    constructor({
        propertyName,
        getReferenceToPropertyType,
        getReferenceToPropertyTypeForInlineUnion,
        noOptionalProperties,
        generateReadWriteOnlyTypes
    }: SinglePropertySingleUnionTypeGenerator.Init<Context>) {
        this.propertyName = propertyName;
        this.getReferenceToPropertyType = getReferenceToPropertyType;
        this.getReferenceToPropertyTypeForInlineUnion = getReferenceToPropertyTypeForInlineUnion;
        this.noOptionalProperties = noOptionalProperties;
        this.generateReadWriteOnlyTypes = generateReadWriteOnlyTypes;
    }

    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        const typeReference = this.getReferenceToPropertyTypeForInlineUnion(context);
        const hasOptionalToken = !this.noOptionalProperties && typeReference.isOptional;
        return {
            typeNode: ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    getPropertyKey(this.propertyName),
                    hasOptionalToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    this.noOptionalProperties ? typeReference.typeNode : typeReference.typeNodeWithoutUndefined
                )
            ]),
            requestTypeNode: ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    getPropertyKey(this.propertyName),
                    hasOptionalToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    this.noOptionalProperties
                        ? (typeReference.requestTypeNode ?? typeReference.typeNode)
                        : (typeReference.requestTypeNodeWithoutUndefined ?? typeReference.typeNodeWithoutUndefined)
                )
            ]),
            responseTypeNode: ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    getPropertyKey(this.propertyName),
                    hasOptionalToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    this.noOptionalProperties
                        ? (typeReference.responseTypeNode ?? typeReference.typeNode)
                        : (typeReference.responseTypeNodeWithoutUndefined ?? typeReference.typeNodeWithoutUndefined)
                )
            ])
        };
    }

    public getExtendsForInterface(): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    }[] {
        return [];
    }

    public getDiscriminantPropertiesForInterface(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
        return [];
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        return undefined;
    }

    public getNonDiscriminantPropertiesForInterface(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
        const type = this.getReferenceToPropertyType(context);
        const hasQuestionToken = !this.noOptionalProperties && type.isOptional;
        const property: PropertySignatureStructure = {
            kind: StructureKind.PropertySignature,
            name: getPropertyKey(this.propertyName),
            type: getTextOfTsNode(this.noOptionalProperties ? type.typeNode : type.typeNodeWithoutUndefined),
            hasQuestionToken
        };
        return [
            {
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
                    : undefined,
                isReadonly: false,
                isWriteonly: false
            }
        ];
    }

    public getParametersForBuilder(context: Context): ts.ParameterDeclaration[] {
        const type = this.getReferenceToPropertyType(context);
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                type.isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                type.typeNodeWithoutUndefined
            )
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                getPropertyKey(this.propertyName),
                ts.factory.createIdentifier(SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            )
        ];
    }

    public getVisitMethodParameterType(context: Context): ts.TypeNode {
        return this.getReferenceToPropertyType(context).typeNode;
    }

    public getVisitorArguments({
        localReferenceToUnionValue
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(localReferenceToUnionValue, this.propertyName)];
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(existingValue, this.propertyName)];
    }

    public needsRequestResponse(context: Context): { request: boolean; response: boolean } {
        if (!this.generateReadWriteOnlyTypes) {
            return {
                request: false,
                response: false
            };
        }
        const ref = this.getReferenceToPropertyType(context);
        return { request: ref.requestTypeNode != null, response: ref.responseTypeNode != null };
    }
}
