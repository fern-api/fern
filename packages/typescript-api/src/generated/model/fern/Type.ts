import { AliasTypeDefinition } from "./AliasTypeDefinition";
import { EnumTypeDefinition } from "./EnumTypeDefinition";
import { ObjectTypeDefinition } from "./ObjectTypeDefinition";
import { UnionTypeDefinition } from "./UnionTypeDefinition";

export type Type = Type.Object | Type.Union | Type.Alias | Type.Enum;

export declare namespace Type {
    export interface Object extends ObjectTypeDefinition {
        type: "object";
    }

    export interface Union extends UnionTypeDefinition {
        type: "union";
    }

    export interface Alias extends AliasTypeDefinition {
        type: "alias";
    }

    export interface Enum extends EnumTypeDefinition {
        type: "enum";
    }

    interface Visitor<R> {
        object: (value: ObjectTypeDefinition) => R;
        union: (value: UnionTypeDefinition) => R;
        alias: (value: AliasTypeDefinition) => R;
        enum: (value: EnumTypeDefinition) => R;
        unknown: (value: { type: string }) => R;
    }
}

export const Type = {
    object: (value: Omit<Type.Object, "type">): Type.Object => ({
        ...value,
        type: "object",
    }),
    isObject: (value: Type): value is Type.Object => value.type === "object",

    union: (value: Omit<Type.Union, "type">): Type.Union => ({
        ...value,
        type: "union",
    }),
    isUnion: (value: Type): value is Type.Union => value.type === "union",

    alias: (value: Omit<Type.Alias, "type">): Type.Alias => ({
        ...value,
        type: "alias",
    }),
    isAlias: (value: Type): value is Type.Alias => value.type === "alias",

    enum: (value: Omit<Type.Enum, "type">): Type.Enum => ({
        ...value,
        type: "enum",
    }),
    isEnum: (value: Type): value is Type.Enum => value.type === "enum",

    visit: <R>(value: Type, visitor: Type.Visitor<R>): R => {
        switch (value.type) {
            case "object":
                return visitor.object(value);
            case "union":
                return visitor.union(value);
            case "alias":
                return visitor.alias(value);
            case "enum":
                return visitor.enum(value);
            default:
                return visitor.unknown(value);
        }
    },
};
