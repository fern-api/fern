import {
    ContainerType,
    EnumTypeDefinition,
    ObjectTypeDefinition,
    PrimitiveType,
    UnionTypeDefinition,
} from "@fern-api/api";

export type ResolvedType =
    | ResolvedType.Object
    | ResolvedType.Union
    | ResolvedType.Enum
    | ResolvedType.Container
    | ResolvedType.Primitive
    | ResolvedType.Void;

export declare namespace ResolvedType {
    interface Object extends ObjectTypeDefinition {
        _type: "object";
    }

    interface Union extends UnionTypeDefinition {
        _type: "union";
    }

    interface Enum extends EnumTypeDefinition {
        _type: "enum";
    }

    interface Container {
        _type: "container";
        container: ContainerType;
    }

    interface Primitive {
        _type: "primitive";
        primitive: PrimitiveType;
    }

    interface Void {
        _type: "void";
    }

    interface _Visitor<Result> {
        object: (value: ObjectTypeDefinition) => Result;
        union: (value: UnionTypeDefinition) => Result;
        enum: (value: EnumTypeDefinition) => Result;
        container: (value: ContainerType) => Result;
        primitive: (value: PrimitiveType) => Result;
        void: () => Result;
        unknown: () => Result;
    }
}

export const ResolvedType = {
    object: (value: ObjectTypeDefinition): ResolvedType.Object => ({
        ...value,
        _type: "object",
    }),

    union: (value: UnionTypeDefinition): ResolvedType.Union => ({
        ...value,
        _type: "union",
    }),

    enum: (value: EnumTypeDefinition): ResolvedType.Enum => ({
        ...value,
        _type: "enum",
    }),

    container: (value: ContainerType): ResolvedType.Container => ({
        container: value,
        _type: "container",
    }),

    primitive: (value: PrimitiveType): ResolvedType.Primitive => ({
        primitive: value,
        _type: "primitive",
    }),

    void: (): ResolvedType.Void => ({
        _type: "void",
    }),

    _visit: <Result>(value: ResolvedType, visitor: ResolvedType._Visitor<Result>): Result => {
        switch (value._type) {
            case "object":
                return visitor.object(value);
            case "union":
                return visitor.union(value);
            case "enum":
                return visitor.enum(value);
            case "container":
                return visitor.container(value.container);
            case "primitive":
                return visitor.primitive(value.primitive);
            case "void":
                return visitor.void();
            default:
                return visitor.unknown();
        }
    },
};
