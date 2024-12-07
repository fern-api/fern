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
        inlineInlineTypes: boolean;
    }
}

export type ConvertTypeReferenceParams =
    | {
          typeReference: TypeReference;
      } & (
          | {
                inlineType: ConvertTypeReferenceParams.InlineType;
            }
          | {
                forInlineUnion?: true;
            }
      );

export namespace ConvertTypeReferenceParams {
    /**
     * Metadata for converting inline types
     */
    export interface InlineType {
        parentTypeName: string;
        propertyName: string;
        genericIn?: InlineType.GenericIn;
    }

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
    protected inlineInlineTypes: boolean;

    constructor({
        typeResolver,
        treatUnknownAsAny,
        includeSerdeLayer,
        useBigInt,
        inlineInlineTypes
    }: AbstractTypeReferenceConverter.Init) {
        this.typeResolver = typeResolver;
        this.treatUnknownAsAny = treatUnknownAsAny;
        this.includeSerdeLayer = includeSerdeLayer;
        this.useBigInt = useBigInt;
        this.inlineInlineTypes = inlineInlineTypes;
    }

    public convert(params: ConvertTypeReferenceParams): T {
        return TypeReference._visit<T>(params.typeReference, {
            named: (type) => this.named(type, params),
            primitive: (type) => this.primitive(type),
            container: (type) => this.container(type, params),
            unknown: () => (this.treatUnknownAsAny ? this.any() : this.unknown()),
            _other: () => {
                throw new Error("Unexpected type reference: " + params.typeReference.type);
            }
        });
    }

    protected container(container: ContainerType, params: ConvertTypeReferenceParams): T {
        return ContainerType._visit<T>(container, {
            map: (type) => this.map(type, addGenericIn(params, genericIn.Map)),
            list: (type) => this.list(type, addGenericIn(params, genericIn.List)),
            set: (type) => this.set(type, addGenericIn(params, genericIn.Set)),
            optional: (type) => this.optional(type, params),
            literal: (type) => this.literal(type, params),
            _other: () => {
                throw new Error("Unexpected container type: " + container.type);
            }
        });
    }

    protected abstract named(typeName: DeclaredTypeName, params: ConvertTypeReferenceParams): T;
    protected abstract string(): T;
    protected abstract number(): T;
    protected abstract long(): T;
    protected abstract bigInteger(): T;
    protected abstract boolean(): T;
    protected abstract dateTime(): T;
    protected abstract list(itemType: TypeReference, params: ConvertTypeReferenceParams): T;
    protected abstract set(itemType: TypeReference, params: ConvertTypeReferenceParams): T;
    protected abstract optional(itemType: TypeReference, params: ConvertTypeReferenceParams): T;
    protected abstract literal(literal: Literal, params: ConvertTypeReferenceParams): T;
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

    protected map(mapType: MapType, params: ConvertTypeReferenceParams): T {
        const resolvdKeyType = this.typeResolver.resolveTypeReference(mapType.keyType);
        if (resolvdKeyType.type === "named" && resolvdKeyType.shape === ShapeType.Enum) {
            return this.mapWithEnumKeys(mapType, params);
        } else {
            return this.mapWithNonEnumKeys(mapType, params);
        }
    }

    protected abstract mapWithEnumKeys(mapType: MapType, params: ConvertTypeReferenceParams): T;
    protected abstract mapWithNonEnumKeys(mapType: MapType, params: ConvertTypeReferenceParams): T;

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
    params: ConvertTypeReferenceParams,
    genericIn: ConvertTypeReferenceParams.InlineType.GenericIn
): ConvertTypeReferenceParams {
    if ("inlineType" in params) {
        params.inlineType = {
            ...params.inlineType,
            genericIn
        };
    }
    return params;
}
