import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons-v2";
import { TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSamePropertiesAsObjectSingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        extended: DeclaredTypeName;
    }
}

export class RawSamePropertiesAsObjectSingleUnionType extends AbstractRawSingleUnionType<TypeSchemaContext> {
    private extended: DeclaredTypeName;

    constructor({ extended, ...superInit }: RawSamePropertiesAsObjectSingleUnionType.Init) {
        super(superInit);
        this.extended = extended;
    }

    protected getExtends(context: TypeSchemaContext): ts.TypeNode[] {
        return [context.getReferenceToRawNamedType(this.extended).getTypeNode()];
    }

    protected getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: TypeSchemaContext
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: false,
            objectSchema: context.getSchemaOfNamedType(this.extended),
        };
    }
}
