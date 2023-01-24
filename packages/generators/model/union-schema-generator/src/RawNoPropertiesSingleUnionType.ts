import { Zurg } from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractRawSingleUnionType } from "./AbstractRawSingleUnionType";

export class RawNoPropertiesSingleUnionType<Context> extends AbstractRawSingleUnionType<Context> {
    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForSchema(): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: true,
            properties: [],
        };
    }
}
