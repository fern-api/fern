import { ContainerType } from "./ContainerType";
import { TypeName } from "./NamedTypeReference";
import { PrimitiveType } from "./PrimitiveType";

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
}

export const TypeReference = Object.freeze({
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
});
