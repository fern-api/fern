import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    MapType,
    PrimitiveType,
    ShapeType,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

export declare namespace AbstractTypeReferenceConverter {
    export interface Init {
        typeResolver: TypeResolver;
    }
}

export abstract class AbstractTypeReferenceConverter<T> {
    protected typeResolver: TypeResolver;

    constructor({ typeResolver }: AbstractTypeReferenceConverter.Init) {
        this.typeResolver = typeResolver;
    }

    public convert(typeReference: TypeReference): T {
        return TypeReference._visit<T>(typeReference, {
            named: this.named.bind(this),
            primitive: this.primitive.bind(this),
            container: this.container.bind(this),
            unknown: this.unknown.bind(this),
            _unknown: () => {
                throw new Error("Unexpected type reference: " + typeReference._type);
            },
        });
    }

    protected container(container: ContainerType): T {
        return ContainerType._visit<T>(container, {
            map: this.map.bind(this),
            list: this.list.bind(this),
            set: this.set.bind(this),
            optional: this.optional.bind(this),
            literal: this.literal.bind(this),
            _unknown: () => {
                throw new Error("Unexpected container type: " + container._type);
            },
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

    protected primitive(primitive: PrimitiveType): T {
        return PrimitiveType._visit<T>(primitive, {
            boolean: this.boolean.bind(this),
            double: this.number.bind(this),
            integer: this.number.bind(this),
            long: this.number.bind(this),
            string: this.string.bind(this),
            uuid: this.string.bind(this),
            dateTime: this.dateTime.bind(this),
            date: this.string.bind(this),
            base64: this.string.bind(this),
            _unknown: () => {
                throw new Error("Unexpected primitive type: " + primitive);
            },
        });
    }

    protected map(mapType: MapType): T {
        const resolvdKeyType = this.typeResolver.resolveTypeReference(mapType.keyType);
        if (resolvdKeyType._type === "named" && resolvdKeyType.shape === ShapeType.Enum) {
            return this.mapWithEnumKeys(mapType);
        } else {
            return this.mapWithNonEnumKeys(mapType);
        }
    }

    protected abstract mapWithEnumKeys(mapType: MapType): T;
    protected abstract mapWithNonEnumKeys(mapType: MapType): T;

    protected isTypeReferencePrimitive(typeReference: TypeReference): boolean {
        const resolvedType = this.typeResolver.resolveTypeReference(typeReference);
        return resolvedType._type === "primitive";
    }

    protected generateNonOptionalTypeReferenceNode(typeNode: ts.TypeNode): TypeReferenceNode {
        return {
            isOptional: false,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
        };
    }
}
