import * as model from "..";

export type ContainerType = ContainerType.List | ContainerType.Map | ContainerType.Optional | ContainerType.Set;

export declare namespace ContainerType {
    interface List {
        _type: "list";
        list: model.TypeReference;
    }

    interface Map extends model.MapType {
        _type: "map";
    }

    interface Optional {
        _type: "optional";
        optional: model.TypeReference;
    }

    interface Set {
        _type: "set";
        set: model.TypeReference;
    }

    export interface _Visitor<Result> {
        list: (value: model.TypeReference) => Result;
        map: (value: model.MapType) => Result;
        optional: (value: model.TypeReference) => Result;
        set: (value: model.TypeReference) => Result;
        _unknown: () => Result;
    }
}

export const ContainerType = {
    list: (value: model.TypeReference): ContainerType.List => ({
        list: value,
        _type: "list",
    }),

    map: (value: model.MapType): ContainerType.Map => ({
        ...value,
        _type: "map",
    }),

    optional: (value: model.TypeReference): ContainerType.Optional => ({
        optional: value,
        _type: "optional",
    }),

    set: (value: model.TypeReference): ContainerType.Set => ({
        set: value,
        _type: "set",
    }),

    _visit: <Result>(value: ContainerType, visitor: ContainerType._Visitor<Result>): Result => {
        switch (value._type) {
            case "list":
                return visitor.list(value.list);
            case "map":
                return visitor.map(value);
            case "optional":
                return visitor.optional(value.optional);
            case "set":
                return visitor.set(value.set);
            default:
                return visitor._unknown();
        }
    },

    _types: (): ContainerType["_type"][] => ["list", "map", "optional", "set"],
} as const;
