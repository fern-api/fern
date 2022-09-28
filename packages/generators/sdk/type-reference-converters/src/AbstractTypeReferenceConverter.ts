import {
    ContainerType,
    DeclaredTypeName,
    MapType,
    PrimitiveType,
    ResolvedTypeReference,
    ShapeType,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";

export declare namespace AbstractTypeReferenceConverter {
    export interface Init {
        resolveType: (typeName: DeclaredTypeName) => ResolvedTypeReference;
    }
}

export abstract class AbstractTypeReferenceConverter<T> {
    protected resolveType: (typeName: DeclaredTypeName) => ResolvedTypeReference;

    constructor({ resolveType }: AbstractTypeReferenceConverter.Init) {
        this.resolveType = resolveType;
    }

    public convert(typeReference: TypeReference): T {
        return TypeReference._visit<T>(typeReference, {
            named: this.named.bind(this),
            primitive: this.primitive.bind(this),
            container: (container) => {
                return ContainerType._visit<T>(container, {
                    map: this.map.bind(this),
                    list: this.list.bind(this),
                    set: this.set.bind(this),
                    optional: this.optional.bind(this),
                    _unknown: () => {
                        throw new Error("Unexpected container type: " + container._type);
                    },
                });
            },
            unknown: this.unknown.bind(this),
            void: this.void.bind(this),
            _unknown: () => {
                throw new Error("Unexpected type reference: " + typeReference._type);
            },
        });
    }

    protected void(): T {
        throw new Error("Void is not supported here");
    }

    protected abstract named(typeName: DeclaredTypeName): T;
    protected abstract primitive(primitive: PrimitiveType): T;
    protected abstract map(map: MapType): T;
    protected abstract list(itemType: TypeReference): T;
    protected abstract set(itemType: TypeReference): T;
    protected abstract optional(itemType: TypeReference): T;
    protected abstract unknown(): T;

    protected keyType(keyType: TypeReference): T {
        if (keyType._type !== "named") {
            return this.convert(keyType);
        }
        const resolvedType = this.resolveType(keyType);
        return ResolvedTypeReference._visit<T>(resolvedType, {
            container: () => {
                throw new Error("Containers are not supported as map keys");
            },
            primitive: (primitive) => this.primitive(primitive),
            unknown: () => {
                throw new Error("Unknown is not supported as a map key");
            },
            void: () => {
                throw new Error("Void is not supported as a map key");
            },
            named: (resolvedNamedType) =>
                ShapeType._visit(resolvedNamedType.shape, {
                    object: () => {
                        throw new Error("Objects are not supported as map keys");
                    },
                    union: () => {
                        throw new Error("Unions are not supported as map keys");
                    },
                    enum: () => this.enumAsString(keyType),
                    _unknown: () => {
                        throw new Error("Unknown ShapeType: " + resolvedNamedType.shape);
                    },
                }),
            _unknown: () => {
                throw new Error("Unknown ResolvedReferenceType: " + resolvedType._type);
            },
        });
    }

    protected enumAsString(_enumTypeName: DeclaredTypeName): T {
        // by default, treat enums as strings in maps. otherwise, typescript assumes
        // that there won't be unknown values
        return this.primitive(PrimitiveType.String);
    }

    protected getSyntaxKindForPrimitive(
        primitive: PrimitiveType
    ): ts.SyntaxKind.BooleanKeyword | ts.SyntaxKind.StringKeyword | ts.SyntaxKind.NumberKeyword {
        return PrimitiveType._visit<
            ts.SyntaxKind.BooleanKeyword | ts.SyntaxKind.StringKeyword | ts.SyntaxKind.NumberKeyword
        >(primitive, {
            boolean: () => ts.SyntaxKind.BooleanKeyword,
            double: () => ts.SyntaxKind.NumberKeyword,
            integer: () => ts.SyntaxKind.NumberKeyword,
            long: () => ts.SyntaxKind.NumberKeyword,
            string: () => ts.SyntaxKind.StringKeyword,
            uuid: () => ts.SyntaxKind.StringKeyword,
            dateTime: () => ts.SyntaxKind.StringKeyword,
            _unknown: () => {
                throw new Error("Unexpected primitive type: " + primitive);
            },
        });
    }

    protected isTypeReferencePrimitive(typeReference: TypeReference): boolean {
        if (typeReference._type === "primitive") {
            return true;
        }
        if (typeReference._type !== "named") {
            return false;
        }
        const resolvedType = this.resolveType(typeReference);
        return resolvedType._type === "primitive";
    }
}
