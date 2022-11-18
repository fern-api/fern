import { SingleResponseErrorProperty } from "@fern-fern/ir-model/services/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { SingleUnionTypeGenerator } from "@fern-typescript/types-v2";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export class SinglePropertySingleUnionTypeGenerator implements SingleUnionTypeGenerator {
    private singleProperty: SingleResponseErrorProperty;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ singleProperty }: { singleProperty: SingleResponseErrorProperty }) {
        this.singleProperty = singleProperty;
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(
        file: SdkFile,
        { isRaw }: { isRaw: boolean }
    ): OptionalKind<PropertySignatureStructure>[] {
        const error = isRaw
            ? file.getReferenceToRawError(this.singleProperty.error)
            : file.getReferenceToError(this.singleProperty.error);
        return [
            {
                name: isRaw ? this.singleProperty.name.wireValue : this.getSinglePropertyKey(),
                type: getTextOfTsNode(error.getTypeNode()),
            },
        ];
    }

    public getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[] {
        const error = file.getReferenceToError(this.singleProperty.error);
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                SinglePropertySingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                error.getTypeNode()
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
        return file.getReferenceToError(this.singleProperty.error).getTypeNode();
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
                    value: file.getErrorSchema(this.singleProperty.error),
                },
            ],
        };
    }

    private getSinglePropertyKey(): string {
        return this.singleProperty.name.camelCase;
    }
}
