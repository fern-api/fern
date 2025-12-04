import { DeclaredTypeName, Literal, MapType, TypeReference } from "@fern-fern/ir-sdk/api";
import { Schema, SchemaGenerator, Zurg } from "@fern-typescript/commons";

import { AbstractTypeReferenceConverter, ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter";

export declare namespace TypeReferenceToSchemaConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        getSchemaOfNamedType: (typeName: DeclaredTypeName) => Schema;
        zurg: Zurg | SchemaGenerator;
    }
}

export class TypeReferenceToSchemaConverter extends AbstractTypeReferenceConverter<Schema> {
    private getSchemaOfNamedType: (typeName: DeclaredTypeName) => Schema;
    private zurg: Zurg | SchemaGenerator;

    constructor({ getSchemaOfNamedType, zurg, ...superInit }: TypeReferenceToSchemaConverter.Init) {
        super(superInit);
        this.getSchemaOfNamedType = getSchemaOfNamedType;
        this.zurg = zurg;
    }

    protected override named(typeName: DeclaredTypeName, params: ConvertTypeReferenceParams): Schema {
        return this.getSchemaOfNamedType(typeName);
    }

    protected override boolean(): Schema {
        return this.zurg.boolean();
    }

    protected override string(): Schema {
        return this.zurg.string();
    }

    protected long(): Schema {
        if (this.useBigInt) {
            return this.zurg.bigint();
        }
        return this.zurg.number();
    }

    protected bigInteger(): Schema {
        if (this.useBigInt) {
            return this.zurg.bigint();
        }
        return this.zurg.string();
    }

    protected override number(): Schema {
        return this.zurg.number();
    }

    protected override dateTime(): Schema {
        return this.zurg.date();
    }

    protected override nullable(itemType: TypeReference, params: ConvertTypeReferenceParams): Schema {
        if (itemType.type === "container" && itemType.container.type === "optional") {
            return this.convert({ ...params, typeReference: itemType.container.optional }).optionalNullable();
        }
        return this.convert({ ...params, typeReference: itemType }).nullable();
    }

    protected override optional(itemType: TypeReference, params: ConvertTypeReferenceParams): Schema {
        if (itemType.type === "container" && itemType.container.type === "nullable") {
            return this.convert({ ...params, typeReference: itemType.container.nullable }).optionalNullable();
        }
        return this.convert({ ...params, typeReference: itemType }).optional();
    }

    protected override unknown(): Schema {
        return this.zurg.unknown();
    }

    protected override any(): Schema {
        return this.zurg.any();
    }

    protected override list(itemType: TypeReference, params: ConvertTypeReferenceParams): Schema {
        return this.zurg.list(this.convert({ ...params, typeReference: itemType }));
    }

    protected override literal(literal: Literal): Schema {
        return Literal._visit(literal, {
            string: (value) => this.zurg.stringLiteral(value),
            boolean: (value) => this.zurg.booleanLiteral(value),
            _other: () => {
                throw new Error("Unknown literal: " + literal.type);
            }
        });
    }

    protected override mapWithEnumKeys(map: MapType, params: ConvertTypeReferenceParams): Schema {
        return this.mapWithOptionalValues(map, params);
    }

    protected override mapWithNonEnumKeys(
        { keyType, valueType }: MapType,
        params: ConvertTypeReferenceParams
    ): Schema {
        return this.zurg.record({
            keySchema: this.convert({ ...params, typeReference: keyType }),
            valueSchema: this.convert({ ...params, typeReference: valueType })
        });
    }

    protected mapWithOptionalValues({ keyType, valueType }: MapType, params: ConvertTypeReferenceParams): Schema {
        const valueSchema = this.convert({ ...params, typeReference: valueType });
        return this.zurg.record({
            keySchema: this.convert({ ...params, typeReference: keyType }),
            valueSchema: valueSchema.isOptional ? valueSchema : valueSchema.optional()
        });
    }

    protected override set(itemType: TypeReference, params: ConvertTypeReferenceParams): Schema {
        if (this.isTypeReferencePrimitive(itemType)) {
            return this.zurg.set(this.convert({ ...params, typeReference: itemType }));
        } else {
            return this.list(itemType, params);
        }
    }
}
