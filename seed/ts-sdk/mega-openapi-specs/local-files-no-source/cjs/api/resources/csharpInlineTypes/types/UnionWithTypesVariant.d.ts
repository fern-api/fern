/**
 * A union with a variant named "types" that could collide with the inline Types class
 */
export type UnionWithTypesVariant = {
    type: "types";
} | {
    type: "otherVariant";
};
