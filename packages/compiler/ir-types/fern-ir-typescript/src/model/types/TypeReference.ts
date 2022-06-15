import * as model from "..";

export type TypeReference =
    | TypeReference.Container
    | TypeReference.Named
    | TypeReference.Primitive
    | TypeReference.Void;

export declare namespace TypeReference {
    interface Container {
        _type: "container";
        container: model.ContainerType;
    }

    interface Named extends model.NamedType {
        _type: "named";
    }

    interface Primitive {
        _type: "primitive";
        primitive: model.PrimitiveType;
    }

    interface Void {
        _type: "void";
    }

    export interface _Visitor<Result> {
        container: (value: model.ContainerType) => Result;
        named: (value: model.NamedType) => Result;
        primitive: (value: model.PrimitiveType) => Result;
        void: () => Result;
        _unknown: () => Result;
    }
}

export const TypeReference = {
    container: (value: model.ContainerType): TypeReference.Container => ({
        container: value,
        _type: "container",
    }),

    named: (value: model.NamedType): TypeReference.Named => ({
        ...value,
        _type: "named",
    }),

    primitive: (value: model.PrimitiveType): TypeReference.Primitive => ({
        primitive: value,
        _type: "primitive",
    }),

    void: (): TypeReference.Void => ({
        _type: "void",
    }),

    _visit: <Result>(value: TypeReference, visitor: TypeReference._Visitor<Result>): Result => {
        switch (value._type) {
            case "container":
                return visitor.container(value.container);
            case "named":
                return visitor.named(value);
            case "primitive":
                return visitor.primitive(value.primitive);
            case "void":
                return visitor.void();
            default:
                return visitor._unknown();
        }
    },

    _types: (): TypeReference["_type"][] => ["container", "named", "primitive", "void"],
} as const;
