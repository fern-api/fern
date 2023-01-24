import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { ErrorDiscriminationByPropertyStrategy } from "@fern-fern/ir-model/ir";
import { getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import { EndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSinglePropertyErrorSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        errorName: DeclaredErrorName;
        discriminationStrategy: ErrorDiscriminationByPropertyStrategy;
    }
}

export class RawSinglePropertyErrorSingleUnionType extends AbstractRawSingleUnionType<EndpointTypeSchemasContext> {
    private errorName: DeclaredErrorName;
    private discriminationStrategy: ErrorDiscriminationByPropertyStrategy;

    constructor({ errorName, discriminationStrategy, ...superInit }: RawSinglePropertyErrorSingleUnionType.Init) {
        super(superInit);
        this.errorName = errorName;
        this.discriminationStrategy = discriminationStrategy;
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
                name: `"${this.discriminationStrategy.contentProperty.wireValue}"`,
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
                        parsed: this.discriminationStrategy.contentProperty.name.camelCase.unsafeName,
                        raw: this.discriminationStrategy.contentProperty.wireValue,
                    },
                    value: context.errorSchema.getSchemaOfError(this.errorName),
                },
            ],
        };
    }
}
