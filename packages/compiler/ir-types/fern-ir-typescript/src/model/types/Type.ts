import * as model from "..";

export type Type = Type.Alias | Type.Enum | Type.Object | Type.Union;

export declare namespace Type {
    interface Alias extends model.AliasTypeDefinition {
        _type: "alias";
    }

    interface Enum extends model.EnumTypeDefinition {
        _type: "enum";
    }

    interface Object extends model.ObjectTypeDefinition {
        _type: "object";
    }

    interface Union extends model.UnionTypeDefinition {
        _type: "union";
    }

    export interface _Visitor<Result> {
        alias: (value: model.AliasTypeDefinition) => Result;
        enum: (value: model.EnumTypeDefinition) => Result;
        object: (value: model.ObjectTypeDefinition) => Result;
        union: (value: model.UnionTypeDefinition) => Result;
        _unknown: () => Result;
    }
}

export const Type = {
    alias: (value: model.AliasTypeDefinition): Type.Alias => ({
        ...value,
        _type: "alias",
    }),

    enum: (value: model.EnumTypeDefinition): Type.Enum => ({
        ...value,
        _type: "enum",
    }),

    object: (value: model.ObjectTypeDefinition): Type.Object => ({
        ...value,
        _type: "object",
    }),

    union: (value: model.UnionTypeDefinition): Type.Union => ({
        ...value,
        _type: "union",
    }),

    _visit: <Result>(value: Type, visitor: Type._Visitor<Result>): Result => {
        switch (value._type) {
            case "alias":
                return visitor.alias(value);
            case "enum":
                return visitor.enum(value);
            case "object":
                return visitor.object(value);
            case "union":
                return visitor.union(value);
            default:
                return visitor._unknown();
        }
    },

    _types: (): Type["_type"][] => ["alias", "enum", "object", "union"],
} as const;
