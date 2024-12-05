import { DeclaredTypeName, Literal, MapType, TypeReference } from "@fern-fern/ir-sdk/api";
import { Zurg } from "@fern-typescript/commons";
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

    protected override named(
        typeName: DeclaredTypeName,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): Zurg.Schema {
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

    protected override optional(
        itemType: TypeReference,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): Zurg.Schema {
        return this.convert({ typeReference: itemType, inlineType }).optional();
    }

    protected override unknown(): Zurg.Schema {
        return this.zurg.unknown();
    }

    protected override any(): Zurg.Schema {
        return this.zurg.any();
    }

    protected override list(
        itemType: TypeReference,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): Zurg.Schema {
        return this.zurg.list(this.convert({ typeReference: itemType, inlineType }));
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

    protected override mapWithEnumKeys(
        map: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): Zurg.Schema {
        return this.mapWithOptionalValues(map, inlineType);
    }

    protected override mapWithNonEnumKeys(
        { keyType, valueType }: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): Zurg.Schema {
        return this.zurg.record({
            keySchema: this.convert({ typeReference: keyType, inlineType }),
            valueSchema: this.convert({ typeReference: valueType, inlineType })
        });
    }

    protected mapWithOptionalValues(
        { keyType, valueType }: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): Zurg.Schema {
        const valueSchema = this.convert({ typeReference: valueType, inlineType });
        return this.zurg.record({
            keySchema: this.convert({ typeReference: keyType, inlineType }),
            valueSchema: valueSchema.isOptional ? valueSchema : valueSchema.optional()
        });
    }

    protected override set(
        itemType: TypeReference,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): Zurg.Schema {
        if (this.isTypeReferencePrimitive(itemType)) {
            return this.zurg.set(this.convert({ typeReference: itemType, inlineType }));
        } else {
            return this.list(itemType, inlineType);
        }
    }
}
