import { FernIr } from "@fern-fern/ir-sdk";
import { Zurg } from "@fern-typescript/commons";

import { AbstractTypeReferenceConverter, ConvertTypeReferenceParams } from "./AbstractTypeReferenceConverter.js";

export declare namespace TypeReferenceToSchemaConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        getSchemaOfNamedType: (typeName: FernIr.DeclaredTypeName) => Zurg.Schema;
        zurg: Zurg;
    }
}

export class TypeReferenceToSchemaConverter extends AbstractTypeReferenceConverter<Zurg.Schema> {
    private getSchemaOfNamedType: (typeName: FernIr.DeclaredTypeName) => Zurg.Schema;
    private zurg: Zurg;

    constructor({ getSchemaOfNamedType, zurg, ...superInit }: TypeReferenceToSchemaConverter.Init) {
        super(superInit);
        this.getSchemaOfNamedType = getSchemaOfNamedType;
        this.zurg = zurg;
    }

    protected override named(typeName: FernIr.DeclaredTypeName, params: ConvertTypeReferenceParams): Zurg.Schema {
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

    protected override nullable(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): Zurg.Schema {
        if (itemType.type === "container" && itemType.container.type === "optional") {
            return this.convert({ ...params, typeReference: itemType.container.optional }).optionalNullable();
        }
        return this.convert({ ...params, typeReference: itemType }).nullable();
    }

    protected override optional(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): Zurg.Schema {
        if (itemType.type === "container" && itemType.container.type === "nullable") {
            return this.convert({ ...params, typeReference: itemType.container.nullable }).optionalNullable();
        }
        return this.convert({ ...params, typeReference: itemType }).optional();
    }

    protected override unknown(): Zurg.Schema {
        return this.zurg.unknown();
    }

    protected override any(): Zurg.Schema {
        return this.zurg.any();
    }

    protected override list(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): Zurg.Schema {
        return this.zurg.list(this.convert({ ...params, typeReference: itemType }));
    }

    protected override literal(literal: FernIr.Literal): Zurg.Schema {
        return FernIr.Literal._visit(literal, {
            string: (value) => this.zurg.stringLiteral(value),
            boolean: (value) => this.zurg.booleanLiteral(value),
            _other: () => {
                throw new Error("Unknown literal: " + literal.type);
            }
        });
    }

    protected override mapWithEnumKeys(map: FernIr.MapType, params: ConvertTypeReferenceParams): Zurg.Schema {
        return this.mapWithOptionalValues(map, params);
    }

    protected override mapWithNonEnumKeys(
        { keyType, valueType }: FernIr.MapType,
        params: ConvertTypeReferenceParams
    ): Zurg.Schema {
        // Strip optional/nullable wrappers from the value type to match the type converter,
        // which uses `typeNodeWithoutUndefined` for record value types.
        const unwrappedValueType = unwrapOptionalAndNullable(valueType);
        return this.zurg.record({
            keySchema: this.convert({ ...params, typeReference: keyType }),
            valueSchema: this.convert({ ...params, typeReference: unwrappedValueType })
        });
    }

    protected mapWithOptionalValues(
        { keyType, valueType }: FernIr.MapType,
        params: ConvertTypeReferenceParams
    ): Zurg.Schema {
        const valueSchema = this.convert({ ...params, typeReference: valueType });
        return this.zurg.partialRecord({
            keySchema: this.convert({ ...params, typeReference: keyType }),
            valueSchema: valueSchema.isOptional ? valueSchema : valueSchema.optional()
        });
    }

    protected override set(itemType: FernIr.TypeReference, params: ConvertTypeReferenceParams): Zurg.Schema {
        if (this.isTypeReferencePrimitive(itemType)) {
            return this.zurg.set(this.convert({ ...params, typeReference: itemType }));
        } else {
            return this.list(itemType, params);
        }
    }
}

/**
 * Unwraps optional and nullable container wrappers from a type reference.
 * This is used for map value types where the type converter strips optional/nullable
 * (via `typeNodeWithoutUndefined`) but the schema converter needs to match.
 */
function unwrapOptionalAndNullable(typeReference: FernIr.TypeReference): FernIr.TypeReference {
    if (typeReference.type === "container") {
        if (typeReference.container.type === "optional") {
            return unwrapOptionalAndNullable(typeReference.container.optional);
        }
        if (typeReference.container.type === "nullable") {
            return unwrapOptionalAndNullable(typeReference.container.nullable);
        }
    }
    return typeReference;
}
