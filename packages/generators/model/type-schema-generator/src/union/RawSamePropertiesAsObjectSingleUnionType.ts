import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons";
import { WithTypeSchemaContextMixin } from "@fern-typescript/contexts";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSamePropertiesAsObjectSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        extended: DeclaredTypeName;
    }
}

export class RawSamePropertiesAsObjectSingleUnionType<
    Context extends WithTypeSchemaContextMixin
> extends AbstractRawSingleUnionType<Context> {
    private extended: DeclaredTypeName;

    constructor({ extended, ...superInit }: RawSamePropertiesAsObjectSingleUnionType.Init) {
        super(superInit);
        this.extended = extended;
    }

    protected getExtends(context: Context): ts.TypeNode[] {
        return [context.typeSchema.getReferenceToRawNamedType(this.extended).getTypeNode()];
    }

    protected getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: Context
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: false,
            objectSchema: context.typeSchema.getSchemaOfNamedType(this.extended, { isGeneratingSchema: true }),
        };
    }
}
