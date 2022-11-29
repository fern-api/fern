import { Zurg } from "@fern-typescript/commons-v2";
import { BaseContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractRawSingleUnionType } from "./AbstractRawSingleUnionType";

export class RawNoPropertiesSingleUnionType<Context extends BaseContext> extends AbstractRawSingleUnionType<Context> {
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
