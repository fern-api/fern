import { assertNever } from "@fern-api/core-utils";
import { DeclaredTypeName, MapType, PrimitiveType, TypeReference } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { AbstractTypeReferenceConverter } from "./AbstractTypeReferenceConverter";

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

    protected named(typeName: DeclaredTypeName): Zurg.Schema {
        return this.getSchemaOfNamedType(typeName);
    }

    protected primitive(primitive: PrimitiveType): Zurg.Schema {
        const syntaxKind = this.getSyntaxKindForPrimitive(primitive);
        switch (syntaxKind) {
            case ts.SyntaxKind.StringKeyword:
                return this.zurg.string();
            case ts.SyntaxKind.NumberKeyword:
                return this.zurg.number();
            case ts.SyntaxKind.BooleanKeyword:
                return this.zurg.boolean();
            default:
                assertNever(syntaxKind);
        }
    }

    protected optional(itemType: TypeReference): Zurg.Schema {
        return this.convert(itemType).optional();
    }

    protected unknown(): Zurg.Schema {
        return this.zurg.unknown();
    }

    protected list(itemType: TypeReference): Zurg.Schema {
        return this.zurg.list(this.convert(itemType));
    }

    protected map({ keyType, valueType }: MapType): Zurg.Schema {
        return this.zurg.record({
            keySchema: this.keyType(keyType),
            valueSchema: this.convert(valueType),
        });
    }

    protected set(itemType: TypeReference): Zurg.Schema {
        const itemSchema = this.convert(itemType);
        if (this.isTypeReferencePrimitive(itemType)) {
            return this.zurg.set(itemSchema);
        } else {
            return this.zurg.list(itemSchema);
        }
    }
}
