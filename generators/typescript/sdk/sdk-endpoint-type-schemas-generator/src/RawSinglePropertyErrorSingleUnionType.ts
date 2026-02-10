import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey, getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSinglePropertyErrorSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        errorName: FernIr.DeclaredErrorName;
        discriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy;
    }
}

export class RawSinglePropertyErrorSingleUnionType extends AbstractRawSingleUnionType<SdkContext> {
    private errorName: FernIr.DeclaredErrorName;
    private discriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy;

    constructor({ errorName, discriminationStrategy, ...superInit }: RawSinglePropertyErrorSingleUnionType.Init) {
        super(superInit);
        this.errorName = errorName;
        this.discriminationStrategy = discriminationStrategy;
    }

    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(
        context: SdkContext
    ): OptionalKind<PropertySignatureStructure>[] {
        const errorDeclaration = context.sdkError.getErrorDeclaration(this.errorName);
        if (errorDeclaration.type == null) {
            throw new Error(
                `Cannot generate single-property error because ${this.errorName.name.originalName} does not have a type.`
            );
        }
        const type = context.typeSchema.getReferenceToRawType(errorDeclaration.type).typeNode;

        return [
            {
                name: getPropertyKey(this.discriminationStrategy.contentProperty.wireValue),
                type: getTextOfTsNode(type)
            }
        ];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: SdkContext
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        const errorDeclaration = context.sdkError.getErrorDeclaration(this.errorName);
        if (errorDeclaration.type == null) {
            throw new Error(
                `Cannot generate single-property error because ${this.errorName.name.originalName} does not have a type.`
            );
        }

        return context.coreUtilities.zurg.object([
            {
                key: {
                    parsed: this.discriminationStrategy.contentProperty.name.camelCase.unsafeName,
                    raw: this.discriminationStrategy.contentProperty.wireValue
                },
                value: context.typeSchema.getSchemaOfTypeReference(errorDeclaration.type)
            }
        ]);
    }
}
