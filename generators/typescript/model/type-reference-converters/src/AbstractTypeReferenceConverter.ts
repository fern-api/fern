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

export type ConvertTypeReferenceParams = {
    typeReference: TypeReference;
    inlineType: ConvertTypeReferenceParams.InlineType | undefined;
};

export namespace ConvertTypeReferenceParams {
    /**
     * Metadata for converting inline types
     */
    export type InlineType = {
        parentTypeName: string;
        propertyName: string;
        genericIn?: InlineType.GenericIn;
    };

    export namespace InlineType {
        export const GenericIn = {
            List: "list",
            Map: "map",
            Set: "set"
        } as const;
        export type GenericIn = typeof GenericIn[keyof typeof GenericIn];
    }
}

const genericIn = ConvertTypeReferenceParams.InlineType.GenericIn;

export abstract class AbstractTypeReferenceConverter<T> {
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

    public convert({ typeReference, inlineType }: ConvertTypeReferenceParams): T {
        return TypeReference._visit<T>(typeReference, {
            named: (type) => this.named(type, inlineType),
            primitive: (type) => this.primitive(type),
            container: (type) => this.container(type, inlineType),
            unknown: () => (this.treatUnknownAsAny ? this.any() : this.unknown()),
            _other: () => {
                throw new Error("Unexpected type reference: " + typeReference.type);
            }
        });
    }

    protected container(container: ContainerType, inlineType: ConvertTypeReferenceParams.InlineType | undefined): T {
        return ContainerType._visit<T>(container, {
            map: (type) => this.map(type, addGenericIn(inlineType, genericIn.Map)),
            list: (type) => this.list(type, addGenericIn(inlineType, genericIn.List)),
            set: (type) => this.set(type, addGenericIn(inlineType, genericIn.Set)),
            optional: (type) => this.optional(type, inlineType),
            literal: (type) => this.literal(type, inlineType),
            _other: () => {
                throw new Error("Unexpected container type: " + container.type);
            }
        });
    }

    protected abstract named(
        typeName: DeclaredTypeName,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): T;
    protected abstract string(): T;
    protected abstract number(): T;
    protected abstract long(): T;
    protected abstract bigInteger(): T;
    protected abstract boolean(): T;
    protected abstract dateTime(): T;
    protected abstract list(itemType: TypeReference, inlineType: ConvertTypeReferenceParams.InlineType | undefined): T;
    protected abstract set(itemType: TypeReference, inlineType: ConvertTypeReferenceParams.InlineType | undefined): T;
    protected abstract optional(
        itemType: TypeReference,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): T;
    protected abstract literal(literal: Literal, inlineType: ConvertTypeReferenceParams.InlineType | undefined): T;
    protected abstract unknown(): T;
    protected abstract any(): T;

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

    protected map(mapType: MapType, inlineType: ConvertTypeReferenceParams.InlineType | undefined): T {
        const resolvdKeyType = this.typeResolver.resolveTypeReference(mapType.keyType);
        if (resolvdKeyType.type === "named" && resolvdKeyType.shape === ShapeType.Enum) {
            return this.mapWithEnumKeys(mapType, inlineType);
        } else {
            return this.mapWithNonEnumKeys(mapType, inlineType);
        }
    }

    protected abstract mapWithEnumKeys(
        mapType: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): T;
    protected abstract mapWithNonEnumKeys(
        mapType: MapType,
        inlineType: ConvertTypeReferenceParams.InlineType | undefined
    ): T;

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

function addGenericIn(
    inlineType: ConvertTypeReferenceParams.InlineType | undefined,
    genericIn: ConvertTypeReferenceParams.InlineType.GenericIn
): ConvertTypeReferenceParams.InlineType | undefined {
    if (inlineType) {
        return {
            ...inlineType,
            genericIn
        };
    }
    return undefined;
}
