import { Zurg } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/contexts";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";

export declare namespace RawSamePropertiesAsObjectSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        extended: DeclaredTypeName;
    }
}

export class RawSamePropertiesAsObjectSingleUnionType<
    Context extends ModelContext
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
        return context.typeSchema.getSchemaOfNamedType(this.extended, {
            isGeneratingSchema: true
        }) as Zurg.ObjectSchema;
    }
}
