import { Zurg } from "@fern-typescript/commons-v2";
import { TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export class RawNoPropertiesSingleUnionType extends AbstractRawSingleUnionType<TypeSchemaContext> {
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
