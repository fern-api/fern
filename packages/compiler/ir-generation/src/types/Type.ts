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
}

export const Type = {
    object: (value: Omit<Type.Object, "type">): Type.Object => ({
        ...value,
        type: "object",
    }),
    isObject: (type: Type): type is Type.Object => type.type === "object",

    union: (value: Omit<Type.Union, "type">): Type.Union => ({
        ...value,
        type: "union",
    }),
    isUnion: (type: Type): type is Type.Union => type.type === "union",

    alias: (value: Omit<Type.Alias, "type">): Type.Alias => ({
        ...value,
        type: "alias",
    }),
    isAlias: (type: Type): type is Type.Alias => type.type === "alias",

    enum: (value: Omit<Type.Enum, "type">): Type.Enum => ({
        ...value,
        type: "enum",
    }),
    isEnum: (type: Type): type is Type.Enum => type.type === "enum",

    visit: <R>(value: Type, visitor: TypeVisitor<R>): R => {
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

export interface TypeVisitor<R> {
    object: (object: ObjectTypeDefinition) => R;
    union: (union: UnionTypeDefinition) => R;
    alias: (alias: AliasTypeDefinition) => R;
    enum: (_enum: EnumTypeDefinition) => R;
    unknown: (type: { type: string }) => R;
}
