import { MapType } from "./MapType";
import { TypeReference } from "./TypeReference";

export type ContainerType = ContainerType.Map | ContainerType.List | ContainerType.Set | ContainerType.Optional;

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
}

export const ContainerType = {
    map: (value: Omit<ContainerType.Map, "type">): ContainerType.Map => ({
        ...value,
        type: "map",
    }),
    isMap: (containerType: ContainerType): containerType is ContainerType.Map => containerType.type === "map",

    list: (value: TypeReference): ContainerType.List => ({
        list: value,
        type: "list",
    }),
    isList: (containerType: ContainerType): containerType is ContainerType.List => containerType.type === "list",

    set: (value: TypeReference): ContainerType.Set => ({
        set: value,
        type: "set",
    }),
    isSet: (containerType: ContainerType): containerType is ContainerType.Set => containerType.type === "set",

    optional: (value: TypeReference): ContainerType.Optional => ({
        optional: value,
        type: "optional",
    }),
    isOptional: (containerType: ContainerType): containerType is ContainerType.Optional =>
        containerType.type === "optional",

    visit: <R>(value: ContainerType, visitor: ContainerTypeVisitor<R>): R => {
        switch (value.type) {
            case "map":
                return visitor.map(value);
            case "list":
                return visitor.list(value.list);
            case "set":
                return visitor.set(value.set);
            case "optional":
                return visitor.optional(value.optional);
            default:
                return visitor.unknown(value);
        }
    },
};

export interface ContainerTypeVisitor<R> {
    map: (map: MapType) => R;
    list: (list: TypeReference) => R;
    set: (set: TypeReference) => R;
    optional: (optional: TypeReference) => R;
    unknown: (object: { type: string }) => R;
}
