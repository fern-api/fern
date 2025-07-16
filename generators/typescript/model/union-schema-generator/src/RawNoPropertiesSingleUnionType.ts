import { Zurg } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { AbstractRawSingleUnionType } from "./AbstractRawSingleUnionType";

export class RawNoPropertiesSingleUnionType<Context extends BaseContext> extends AbstractRawSingleUnionType<Context> {
    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: Context
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return context.coreUtilities.zurg.object([]);
    }
}
