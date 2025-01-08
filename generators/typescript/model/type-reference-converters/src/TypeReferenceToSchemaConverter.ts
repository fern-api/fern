import { Zurg } from "@fern-typescript/commons";

import { DeclaredTypeName, Literal, MapType, TypeReference } from "@fern-fern/ir-sdk/api";

import { AbstractTypeReferenceConverter, ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";

export declare namespace TypeReferenceToSchemaConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        getSchemaOfNamedType: (typeName: DeclaredTypeName) => Zurg.Schema;
        zurg: Zurg;
    }
}

export class TypeReferenceToSchemaConverter extends AbstractTypeReferenceConverter<Zurg.Schema> {
    private getSchemaOfNamedType: (typeName: DeclaredTypeName) => Zurg.Schema;
    private zurg: Zurg;

    constructor({ getSchemaOfNamedType, zurg, ...superInit }: TypeReferenceToSchemaConverter.Init) {
        super(superInit);
        this.getSchemaOfNamedType = getSchemaOfNamedType;
        this.zurg = zurg;
    }

    protected override named(typeName: DeclaredTypeName, params: ConvertTypeReferenceParams): Zurg.Schema {
        return this.getSchemaOfNamedType(typeName);
    }

    protected override boolean(): Zurg.Schema {
        return this.zurg.boolean();
    }

    protected override string(): Zurg.Schema {
        return this.zurg.string();
    }

    protected long(): Zurg.Schema {
        if (this.useBigInt) {
            return this.zurg.bigint();
        }
        return this.zurg.number();
    }

    protected bigInteger(): Zurg.Schema {
        if (this.useBigInt) {
            return this.zurg.bigint();
        }
        return this.zurg.string();
    }

    protected override number(): Zurg.Schema {
        return this.zurg.number();
    }

    protected override dateTime(): Zurg.Schema {
        return this.zurg.date();
    }

    protected override optional(itemType: TypeReference, params: ConvertTypeReferenceParams): Zurg.Schema {
        return this.convert({ ...params, typeReference: itemType }).optional();
    }

    protected override unknown(): Zurg.Schema {
        return this.zurg.unknown();
    }

    protected override any(): Zurg.Schema {
        return this.zurg.any();
    }

    protected override list(itemType: TypeReference, params: ConvertTypeReferenceParams): Zurg.Schema {
        return this.zurg.list(this.convert({ ...params, typeReference: itemType }));
    }

    protected override literal(literal: Literal): Zurg.Schema {
        return Literal._visit(literal, {
            string: (value) => this.zurg.stringLiteral(value),
            boolean: (value) => this.zurg.booleanLiteral(value),
            _other: () => {
                throw new Error("Unknown literal: " + literal.type);
            }
        });
    }

    protected override mapWithEnumKeys(map: MapType, params: ConvertTypeReferenceParams): Zurg.Schema {
        return this.mapWithOptionalValues(map, params);
    }

    protected override mapWithNonEnumKeys(
        { keyType, valueType }: MapType,
        params: ConvertTypeReferenceParams
    ): Zurg.Schema {
        return this.zurg.record({
            keySchema: this.convert({ ...params, typeReference: keyType }),
            valueSchema: this.convert({ ...params, typeReference: valueType })
        });
    }

    protected mapWithOptionalValues({ keyType, valueType }: MapType, params: ConvertTypeReferenceParams): Zurg.Schema {
        const valueSchema = this.convert({ ...params, typeReference: valueType });
        return this.zurg.record({
            keySchema: this.convert({ ...params, typeReference: keyType }),
            valueSchema: valueSchema.isOptional ? valueSchema : valueSchema.optional()
        });
    }

    protected override set(itemType: TypeReference, params: ConvertTypeReferenceParams): Zurg.Schema {
        if (this.isTypeReferencePrimitive(itemType)) {
            return this.zurg.set(this.convert({ ...params, typeReference: itemType }));
        } else {
            return this.list(itemType, params);
        }
    }
}
