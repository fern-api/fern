import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    MapType,
    PrimitiveType,
    PrimitiveTypeV1,
    ShapeType,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

export declare namespace AbstractTypeReferenceConverter {
    export interface Init {
        typeResolver: TypeResolver;
        treatUnknownAsAny: boolean;
        includeSerdeLayer: boolean;
        useBigInt: boolean;
    }
}

export abstract class AbstractTypeReferenceConverter<T, TConvertOptions> {
    protected typeResolver: TypeResolver;
    protected treatUnknownAsAny: boolean;
    protected includeSerdeLayer: boolean;
    protected useBigInt: boolean;

    constructor({
        typeResolver,
        treatUnknownAsAny,
        includeSerdeLayer,
        useBigInt
    }: AbstractTypeReferenceConverter.Init) {
        this.typeResolver = typeResolver;
        this.treatUnknownAsAny = treatUnknownAsAny;
        this.includeSerdeLayer = includeSerdeLayer;
        this.useBigInt = useBigInt;
    }

    public convert(typeReference: TypeReference, options?: TConvertOptions): T {
        return TypeReference._visit<T>(typeReference, {
            named: (type) => this.named(type, options),
            primitive: (type) => this.primitive(type),
            container: (type) => this.container(type, options),
            unknown: () => (this.treatUnknownAsAny ? this.any(options) : this.unknown(options)),
            _other: () => {
                throw new Error("Unexpected type reference: " + typeReference.type);
            }
        });
    }

    protected container(container: ContainerType, options?: TConvertOptions): T {
        return ContainerType._visit<T>(container, {
            map: (type) => this.map(type, options),
            list: (type) => this.list(type, options),
            set: (type) => this.set(type, options),
            optional: (type) => this.optional(type, options),
            literal: (type) => this.literal(type, options),
            _other: () => {
                throw new Error("Unexpected container type: " + container.type);
            }
        });
    }

    protected abstract named(typeName: DeclaredTypeName, options?: TConvertOptions): T;
    protected abstract string(): T;
    protected abstract number(): T;
    protected abstract long(): T;
    protected abstract bigInteger(): T;
    protected abstract boolean(): T;
    protected abstract dateTime(): T;
    protected abstract list(itemType: TypeReference, options?: TConvertOptions): T;
    protected abstract set(itemType: TypeReference, options?: TConvertOptions): T;
    protected abstract optional(itemType: TypeReference, options?: TConvertOptions): T;
    protected abstract literal(literal: Literal, options?: TConvertOptions): T;
    protected abstract unknown(options?: TConvertOptions): T;
    protected abstract any(options?: TConvertOptions): T;

    protected primitive(primitive: PrimitiveType): T {
        return PrimitiveTypeV1._visit<T>(primitive.v1, {
            boolean: this.boolean.bind(this),
            double: this.number.bind(this),
            integer: this.number.bind(this),
            long: this.long.bind(this),
            float: this.number.bind(this),
            uint: this.number.bind(this),
            uint64: this.number.bind(this),
            string: this.string.bind(this),
            uuid: this.string.bind(this),
            dateTime: this.dateTime.bind(this),
            date: this.string.bind(this),
            base64: this.string.bind(this),
            bigInteger: this.bigInteger.bind(this),
            _other: () => {
                throw new Error("Unexpected primitive type: " + primitive.v1);
            }
        });
    }

    protected map(mapType: MapType, options?: TConvertOptions): T {
        const resolvdKeyType = this.typeResolver.resolveTypeReference(mapType.keyType);
        if (resolvdKeyType.type === "named" && resolvdKeyType.shape === ShapeType.Enum) {
            return this.mapWithEnumKeys(mapType, options);
        } else {
            return this.mapWithNonEnumKeys(mapType, options);
        }
    }

    protected abstract mapWithEnumKeys(mapType: MapType, options?: TConvertOptions): T;
    protected abstract mapWithNonEnumKeys(mapType: MapType, options?: TConvertOptions): T;

    protected isTypeReferencePrimitive(typeReference: TypeReference): boolean {
        const resolvedType = this.typeResolver.resolveTypeReference(typeReference);
        if (resolvedType.type === "primitive") {
            return true;
        }
        if (resolvedType.type === "named" && resolvedType.shape === ShapeType.Enum) {
            return true;
        }
        return false;
    }

    protected generateNonOptionalTypeReferenceNode(typeNode: ts.TypeNode): TypeReferenceNode {
        return {
            isOptional: false,
            typeNode,
            typeNodeWithoutUndefined: typeNode
        };
    }
}
