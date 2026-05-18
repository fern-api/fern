export type UnionWithDuplicativeDiscriminants = {
    type: "firstItemType";
    name: string;
} | {
    type: "secondItemType";
    title: string;
};
