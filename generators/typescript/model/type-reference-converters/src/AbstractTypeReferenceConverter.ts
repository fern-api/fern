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
    }
}

export abstract class AbstractTypeReferenceConverter<T> {
    protected typeResolver: TypeResolver;
    private treatUnknownAsAny: boolean;

    constructor({ typeResolver, treatUnknownAsAny }: AbstractTypeReferenceConverter.Init) {
        this.typeResolver = typeResolver;
        this.treatUnknownAsAny = treatUnknownAsAny;
    }

    public convert(typeReference: TypeReference): T {
        return TypeReference._visit<T>(typeReference, {
            named: this.named.bind(this),
            primitive: this.primitive.bind(this),
            container: this.container.bind(this),
            unknown: this.treatUnknownAsAny ? this.any.bind(this) : this.unknown.bind(this),
            _other: () => {
                throw new Error("Unexpected type reference: " + typeReference.type);
            }
        });
    }

    protected container(container: ContainerType): T {
        return ContainerType._visit<T>(container, {
            map: this.map.bind(this),
            list: this.list.bind(this),
            set: this.set.bind(this),
            optional: this.optional.bind(this),
            literal: this.literal.bind(this),
            _other: () => {
                throw new Error("Unexpected container type: " + container.type);
            }
        });
    }

    protected abstract named(typeName: DeclaredTypeName): T;
    protected abstract string(): T;
    protected abstract number(): T;
    protected abstract boolean(): T;
    protected abstract dateTime(): T;
    protected abstract list(itemType: TypeReference): T;
    protected abstract set(itemType: TypeReference): T;
    protected abstract optional(itemType: TypeReference): T;
    protected abstract literal(literal: Literal): T;
    protected abstract unknown(): T;
    protected abstract any(): T;

    protected primitive(primitive: PrimitiveType): T {
        return PrimitiveTypeV1._visit<T>(primitive.v1, {
            boolean: this.boolean.bind(this),
            double: this.number.bind(this),
            integer: this.number.bind(this),
            long: this.number.bind(this),
            float: this.number.bind(this),
            uint: this.number.bind(this),
            uint64: this.number.bind(this),
            string: this.string.bind(this),
            uuid: this.string.bind(this),
            dateTime: this.dateTime.bind(this),
            date: this.string.bind(this),
            base64: this.string.bind(this),
            bigInteger: this.string.bind(this),
            _other: () => {
                throw new Error("Unexpected primitive type: " + primitive.v1);
            }
        });
    }

    protected map(mapType: MapType): T {
        const resolvdKeyType = this.typeResolver.resolveTypeReference(mapType.keyType);
        if (resolvdKeyType.type === "named" && resolvdKeyType.shape === ShapeType.Enum) {
            return this.mapWithEnumKeys(mapType);
        } else {
            return this.mapWithNonEnumKeys(mapType);
        }
    }

    protected abstract mapWithEnumKeys(mapType: MapType): T;
    protected abstract mapWithNonEnumKeys(mapType: MapType): T;

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
