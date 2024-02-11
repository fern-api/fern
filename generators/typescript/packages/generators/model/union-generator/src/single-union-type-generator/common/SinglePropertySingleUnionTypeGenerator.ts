import { getTextOfTsNode, TypeReferenceNode } from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "../SingleUnionTypeGenerator";

export declare namespace SinglePropertySingleUnionTypeGenerator {
    export interface Init<Context> {
        propertyName: string;
        getReferenceToPropertyType: (context: Context) => TypeReferenceNode;
        noOptionalProperties: boolean;
    }
}

export class SinglePropertySingleUnionTypeGenerator<Context> implements SingleUnionTypeGenerator<Context> {
    private static BUILDER_PARAMETER_NAME = "value";

    private propertyName: string;
    private getReferenceToPropertyType: (context: Context) => TypeReferenceNode;
    private noOptionalProperties: boolean;

    constructor({
        propertyName,
        getReferenceToPropertyType,
        noOptionalProperties,
    }: SinglePropertySingleUnionTypeGenerator.Init<Context>) {
        this.propertyName = propertyName;
        this.getReferenceToPropertyType = getReferenceToPropertyType;
        this.noOptionalProperties = noOptionalProperties;
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(context: Context): OptionalKind<PropertySignatureStructure>[] {
        const type = this.getReferenceToPropertyType(context);
        return [
            {
                name: this.propertyName,
                type: getTextOfTsNode(this.noOptionalProperties ? type.typeNode : type.typeNodeWithoutUndefined),
                hasQuestionToken: !this.noOptionalProperties && type.isOptional,
            },
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
            ),
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                this.propertyName,
                ts.factory.createIdentifier(SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getVisitMethodParameterType(context: Context): ts.TypeNode {
        return this.getReferenceToPropertyType(context).typeNode;
    }

    public getVisitorArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(localReferenceToUnionValue, this.propertyName)];
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(existingValue, this.propertyName)];
    }
}
