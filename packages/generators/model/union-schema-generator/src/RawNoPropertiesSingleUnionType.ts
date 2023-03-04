import { Zurg } from "@fern-typescript/commons";
import { WithBaseContextMixin } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractRawSingleUnionType } from "./AbstractRawSingleUnionType";

export class RawNoPropertiesSingleUnionType<
    Context extends WithBaseContextMixin
> extends AbstractRawSingleUnionType<Context> {
    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: Context
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return context.base.coreUtilities.zurg.object([]);
    }
}
