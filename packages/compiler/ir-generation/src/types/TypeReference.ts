import { ContainerType } from "./ContainerType";
import { PrimitiveType } from "./PrimitiveType";
import { TypeName } from "./TypeName";

export type TypeReference =
    | TypeReference.Named
    | TypeReference.Primitive
    | TypeReference.Container
    | TypeReference.Void;

export declare namespace TypeReference {
    export interface Named extends TypeName {
        type: "named";
    }

    export interface Primitive {
        type: "primitive";
        primitive: PrimitiveType;
    }

    export interface Container {
        type: "container";
        container: ContainerType;
    }

    export interface Void {
        type: "void";
    }

    export interface Visitor<R> {
        named: (named: TypeName) => R;
        primitive: (primitive: PrimitiveType) => R;
        container: (container: ContainerType) => R;
        void: () => R;
        unknown: (object: { type: string }) => R;
    }
}

export const TypeReference = {
    named: (named: Omit<TypeReference.Named, "type">): TypeReference.Named => ({
        ...named,
        type: "named",
    }),
    isNamed: (typeReference: TypeReference): typeReference is TypeReference.Named => typeReference.type === "named",

    primitive: (primitive: PrimitiveType): TypeReference.Primitive => ({
        primitive,
        type: "primitive",
    }),
    isPrimitive: (typeReference: TypeReference): typeReference is TypeReference.Primitive =>
        typeReference.type === "primitive",

    container: (container: ContainerType): TypeReference.Container => ({
        container,
        type: "container",
    }),
    isContainer: (typeReference: TypeReference): typeReference is TypeReference.Container =>
        typeReference.type === "container",

    void: (): TypeReference.Void => ({
        type: "void",
    }),
    isVoid: (typeReference: TypeReference): typeReference is TypeReference.Void => typeReference.type === "void",

    visit: <R>(value: TypeReference, visitor: TypeReference.Visitor<R>): R => {
        switch (value.type) {
            case "named":
                return visitor.named(value);
            case "primitive":
                return visitor.primitive(value.primitive);
            case "container":
                return visitor.container(value.container);
            case "void":
                return visitor.void();
            default:
                return visitor.unknown(value);
        }
    },
};
