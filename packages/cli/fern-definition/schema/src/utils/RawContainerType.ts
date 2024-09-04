export const RawContainerType = {
    optional: "optional",
    set: "set",
    list: "list",
    map: "map",
    literal: "literal"
} as const;

export const RawContanerTypes: Set<string> = new Set(Object.values(RawContainerType));
