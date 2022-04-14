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

    interface Visitor<R> {
        named: (value: TypeName) => R;
        primitive: (value: PrimitiveType) => R;
        container: (value: ContainerType) => R;
        void: () => R;
        unknown: (value: { type: string }) => R;
    }
}

export const TypeReference = {
    named: (value: Omit<TypeReference.Named, "type">): TypeReference.Named => ({
        ...value,
        type: "named",
    }),
    isNamed: (value: TypeReference): value is TypeReference.Named => value.type === "named",

    primitive: (primitive: PrimitiveType): TypeReference.Primitive => ({
        primitive,
        type: "primitive",
    }),
    isPrimitive: (value: TypeReference): value is TypeReference.Primitive => value.type === "primitive",

    container: (container: ContainerType): TypeReference.Container => ({
        container,
        type: "container",
    }),
    isContainer: (value: TypeReference): value is TypeReference.Container => value.type === "container",

    void: (): TypeReference.Void => ({
        type: "void",
    }),
    isVoid: (value: TypeReference): value is TypeReference.Void => value.type === "void",

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
