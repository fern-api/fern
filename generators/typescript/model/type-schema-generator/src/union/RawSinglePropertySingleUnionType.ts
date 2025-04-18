import { Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedType, ModelContext } from "@fern-typescript/contexts";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { SingleUnionTypeProperty } from "@fern-fern/ir-sdk/api";

export declare namespace RawSinglePropertySingleUnionType {
    export interface Init<Context extends ModelContext> extends AbstractRawSingleUnionType.Init {
        singleProperty: SingleUnionTypeProperty;
        getGeneratedType: () => GeneratedType<Context>;
    }
}

export class RawSinglePropertySingleUnionType<
    Context extends ModelContext
> extends AbstractRawSingleUnionType<Context> {
    private singleProperty: SingleUnionTypeProperty;
    private getGeneratedType: () => GeneratedType<Context>;

    constructor({ singleProperty, getGeneratedType, ...superInit }: RawSinglePropertySingleUnionType.Init<Context>) {
        super(superInit);
        this.singleProperty = singleProperty;
        this.getGeneratedType = getGeneratedType;
    }

    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(context: Context): OptionalKind<PropertySignatureStructure>[] {
        const type = context.typeSchema.getReferenceToRawType(this.singleProperty.type);
        return [
            {
                name: `"${this.singleProperty.name.wireValue}"`,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional
            }
        ];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: Context
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        const unionBeingGenerated = this.getGeneratedType();
        if (unionBeingGenerated.type !== "union") {
            throw new Error("Type is not a union");
        }
        return context.coreUtilities.zurg.object([
            {
                key: {
                    parsed: unionBeingGenerated.getSinglePropertyKey(this.singleProperty),
                    raw: this.singleProperty.name.wireValue
                },
                value: context.typeSchema.getSchemaOfTypeReference(this.singleProperty.type)
            }
        ]);
    }
}
