import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "./SingleUnionTypeGenerator";

export class SinglePropertySingleUnionTypeGenerator implements SingleUnionTypeGenerator {
    private singleProperty: SingleUnionTypeProperty;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ singleProperty }: { singleProperty: SingleUnionTypeProperty }) {
        this.singleProperty = singleProperty;
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(
        file: SdkFile,
        { isRaw }: { isRaw: boolean }
    ): OptionalKind<PropertySignatureStructure>[] {
        const type = isRaw
            ? file.getReferenceToRawType(this.singleProperty.type)
            : file.getReferenceToType(this.singleProperty.type);
        return [
            {
                name: isRaw ? this.singleProperty.name.wireValue : this.getSinglePropertyKey(),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            },
        ];
    }

    public getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[] {
        const type = file.getReferenceToType(this.singleProperty.type);
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

    public getVisitorArgumentsForBuilder(): ts.Expression[] {
        return [ts.factory.createIdentifier(SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)];
    }

    public getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined {
        return file.getReferenceToType(this.singleProperty.type).typeNode;
    }

    public getVisitorArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(localReferenceToUnionValue, this.getSinglePropertyKey())];
    }

    public getBuilderArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [ts.factory.createPropertyAccessExpression(localReferenceToUnionValue, this.getSinglePropertyKey())];
    }

    public getNonDiscriminantPropertiesForSchema(
        file: SdkFile
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: true,
            properties: [
                {
                    key: {
                        parsed: this.getSinglePropertyKey(),
                        raw: this.singleProperty.name.wireValue,
                    },
                    value: file.getSchemaOfTypeReference(this.singleProperty.type),
                },
            ],
        };
    }

    private getSinglePropertyKey(): string {
        return this.singleProperty.name.camelCase;
    }
}
