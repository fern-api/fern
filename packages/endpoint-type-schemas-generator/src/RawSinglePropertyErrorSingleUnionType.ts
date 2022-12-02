import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSinglePropertyErrorSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        errorName: DeclaredErrorName;
    }
}

export class RawSinglePropertyErrorSingleUnionType extends AbstractRawSingleUnionType<EndpointTypeSchemasContext> {
    private errorName: DeclaredErrorName;

    constructor({ errorName, ...superInit }: RawSinglePropertyErrorSingleUnionType.Init) {
        super(superInit);
        this.errorName = errorName;
    }

    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(
        context: EndpointTypeSchemasContext
    ): OptionalKind<PropertySignatureStructure>[] {
        const errorSchema = context.errorSchema.getGeneratedErrorSchema(this.errorName);
        if (errorSchema == null) {
            throw new Error("Error schema does not exist");
        }
        return [
            {
                name: `"${context.base.fernConstants.errorsV2.errorContentKey.wireValue}"`,
                type: getTextOfTsNode(errorSchema.getReferenceToRawShape(context)),
            },
        ];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: EndpointTypeSchemasContext
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: true,
            properties: [
                {
                    key: {
                        parsed: context.base.fernConstants.errorsV2.errorContentKey.name.unsafeName.camelCase,
                        raw: context.base.fernConstants.errorsV2.errorContentKey.wireValue,
                    },
                    value: context.errorSchema.getSchemaOfError(this.errorName),
                },
            ],
        };
    }
}
