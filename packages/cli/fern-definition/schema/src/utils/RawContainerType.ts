export const RawContainerType = {
    optional: "optional",
    nullable: "nullable",
    set: "set",
    list: "list",
    map: "map",
    literal: "literal"
} as const;

export const RawContainerTypes = new Set<string>(Object.values(RawContainerType));
