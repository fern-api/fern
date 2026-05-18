export type UnionWithBaseProperties = {
    type: "integer";
    value?: number | undefined;
} | {
    type: "string";
    value?: string | undefined;
} | {
    type: "foo";
};
