import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export class SinglePropertySingleUnionTypeGenerator implements SingleUnionTypeGenerator {
    private singleProperty: SingleUnionTypeProperty;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ singleProperty }: { singleProperty: SingleUnionTypeProperty }) {
        this.singleProperty = singleProperty;
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(context: TypeContext): OptionalKind<PropertySignatureStructure>[] {
        const type = context.getReferenceToType(this.singleProperty.type);
        return [
            {
                name: this.getSinglePropertyKey(),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            },
        ];
    }

    public getParametersForBuilder(context: TypeContext): ts.ParameterDeclaration[] {
        const type = context.getReferenceToType(this.singleProperty.type);
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
                this.getSinglePropertyKey(),
                ts.factory.createIdentifier(SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getVisitMethodParameterType(context: TypeContext): ts.TypeNode | undefined {
        return context.getReferenceToType(this.singleProperty.type).typeNode;
    }

    public getVisitorArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(localReferenceToUnionValue, this.getSinglePropertyKey())];
    }

    private getSinglePropertyKey(): string {
        return SinglePropertySingleUnionTypeGenerator.getSinglePropertyKey(this.singleProperty);
    }

    public static getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string {
        return singleProperty.name.camelCase;
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(existingValue, this.getSinglePropertyKey())];
    }
}
