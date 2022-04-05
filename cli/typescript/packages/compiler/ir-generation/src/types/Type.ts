import { EnumTypeDefinition } from "./EnumTypeDefinition";
import { ObjectTypeDefinition } from "./ObjectTypeDefinition";
import { TypeReference } from "./TypeReference";
import { UnionTypeDefinition } from "./UnionTypeDefinition";

export type Type = Type.Object | Type.Union | Type.Alias | Type.Enum;

export declare namespace Type {
    export interface Object extends ObjectTypeDefinition {
        type: "object";
    }

    export interface Union extends UnionTypeDefinition {
        type: "union";
    }

    export interface Alias {
        type: "alias";
        alias: TypeReference;
    }

    export interface Enum extends EnumTypeDefinition {
        type: "enum";
    }
}

export const Type = Object.freeze({
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

    alias: (value: TypeReference): Type.Alias => ({
        alias: value,
        type: "alias",
    }),
    isAlias: (type: Type): type is Type.Alias => type.type === "alias",

    enum: (value: Omit<Type.Enum, "type">): Type.Enum => ({
        ...value,
        type: "enum",
    }),
    isEnum: (type: Type): type is Type.Enum => type.type === "enum",
});
