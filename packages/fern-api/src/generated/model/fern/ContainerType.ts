import { MapType } from "./MapType";
import { TypeReference } from "./TypeReference";

export type ContainerType =
    | ContainerType.Map
    | ContainerType.List
    | ContainerType.Set
    | ContainerType.Optional;

export declare namespace ContainerType {
    export interface Map extends MapType {
        type: "map";
    }

    export interface List {
        type: "list";
        list: TypeReference;
    }

    export interface Set {
        type: "set";
        set: TypeReference;
    }

    export interface Optional {
        type: "optional";
        optional: TypeReference;
    }

    interface Visitor<R> {
        map: (value: MapType) => R;
        list: (value: TypeReference) => R;
        set: (value: TypeReference) => R;
        optional: (value: TypeReference) => R;
        unknown: (value: {
            type: string;
        }) => R;
    }
}

export const ContainerType = {
    map: (value: Omit<ContainerType.Map, "type">): ContainerType.Map => ({
        ...value,
        type: "map"
    }),
    isMap: (value: ContainerType): value is ContainerType.Map => value.type === "map",

    list: (list: TypeReference): ContainerType.List => ({
        list,
        type: "list"
    }),
    isList: (value: ContainerType): value is ContainerType.List => value.type === "list",

    set: (set: TypeReference): ContainerType.Set => ({
        set,
        type: "set"
    }),
    isSet: (value: ContainerType): value is ContainerType.Set => value.type === "set",

    optional: (optional: TypeReference): ContainerType.Optional => ({
        optional,
        type: "optional"
    }),
    isOptional: (value: ContainerType): value is ContainerType.Optional => value.type === "optional",

    visit: <R>(value: ContainerType, visitor: ContainerType.Visitor<R>): R => {
        switch (value.type) {
            case "map": return visitor.map(value);
            case "list": return visitor.list(value.list);
            case "set": return visitor.set(value.set);
            case "optional": return visitor.optional(value.optional);
            default: return visitor.unknown(value);
        }
    },
};
