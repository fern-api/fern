import { TypeReferenceNode, getTextOfTsNode } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { NamedType, ObjectProperty, SingleUnionTypeProperty, TypeReference } from "@fern-fern/ir-sdk/api";

import { SingleUnionTypeGenerator } from "../SingleUnionTypeGenerator";

export declare namespace SinglePropertySingleUnionTypeGenerator {
    export interface Init<Context> {
        propertyName: string;
        getReferenceToPropertyType: (context: Context) => TypeReferenceNode;
        getReferenceToPropertyTypeForInlineUnion: (context: Context) => TypeReferenceNode;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
    }
}

export class SinglePropertySingleUnionTypeGenerator<Context extends ModelContext>
    implements SingleUnionTypeGenerator<Context>
{
    private static BUILDER_PARAMETER_NAME = "value";

    private propertyName: string;
    private getReferenceToPropertyType: (context: Context) => TypeReferenceNode;
    private getReferenceToPropertyTypeForInlineUnion: (context: Context) => TypeReferenceNode;
    private noOptionalProperties: boolean;

    constructor({
        propertyName,
        getReferenceToPropertyType,
        getReferenceToPropertyTypeForInlineUnion,
        noOptionalProperties
    }: SinglePropertySingleUnionTypeGenerator.Init<Context>) {
        this.propertyName = propertyName;
        this.getReferenceToPropertyType = getReferenceToPropertyType;
        this.getReferenceToPropertyTypeForInlineUnion = getReferenceToPropertyTypeForInlineUnion;
        this.noOptionalProperties = noOptionalProperties;
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        const typeReference = this.getReferenceToPropertyTypeForInlineUnion(context);
        const hasOptionalToken = !this.noOptionalProperties && typeReference.isOptional;
        return ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
                undefined,
                this.propertyName,
                hasOptionalToken ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                this.noOptionalProperties ? typeReference.typeNode : typeReference.typeNodeWithoutUndefined
            )
        ]);
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getDiscriminantPropertiesForInterface(context: Context): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        return undefined;
    }

    public getNonDiscriminantPropertiesForInterface(context: Context): OptionalKind<PropertySignatureStructure>[] {
        const type = this.getReferenceToPropertyType(context);
        return [
            {
                name: this.propertyName,
                type: getTextOfTsNode(this.noOptionalProperties ? type.typeNode : type.typeNodeWithoutUndefined),
                hasQuestionToken: !this.noOptionalProperties && type.isOptional
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
                this.propertyName,
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
}
