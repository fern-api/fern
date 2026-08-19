import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey, getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSinglePropertyErrorSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        errorName: FernIr.DeclaredErrorName;
        discriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy;
    }
}

export class RawSinglePropertyErrorSingleUnionType extends AbstractRawSingleUnionType<FileContext> {
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
        context: FileContext
    ): OptionalKind<PropertySignatureStructure>[] {
        const errorDeclaration = context.sdkError.getErrorDeclaration(this.errorName);
        if (errorDeclaration.type == null) {
            throw new Error(
                `Cannot generate single-property error because ${getOriginalName(this.errorName.name)} does not have a type.`
            );
        }
        const type = context.typeSchema.getReferenceToRawType(errorDeclaration.type).typeNode;

        return [
            {
                name: getPropertyKey(getWireValue(this.discriminationStrategy.contentProperty)),
                type: getTextOfTsNode(type)
            }
        ];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: FileContext
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        const errorDeclaration = context.sdkError.getErrorDeclaration(this.errorName);
        if (errorDeclaration.type == null) {
            throw new Error(
                `Cannot generate single-property error because ${getOriginalName(this.errorName.name)} does not have a type.`
            );
        }

        return context.coreUtilities.zurg.object([
            {
                key: {
                    parsed: this.case.camelUnsafe(this.discriminationStrategy.contentProperty),
                    raw: getWireValue(this.discriminationStrategy.contentProperty)
                },
                value: context.typeSchema.getSchemaOfTypeReference(errorDeclaration.type)
            }
        ]);
    }
}
