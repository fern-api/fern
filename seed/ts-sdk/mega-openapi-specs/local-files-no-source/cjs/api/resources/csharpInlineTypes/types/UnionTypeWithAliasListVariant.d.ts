export interface UnionTypeWithAliasListVariant {
    type: UnionTypeWithAliasListVariant.Type;
    value?: unknown[] | undefined;
}
export declare namespace UnionTypeWithAliasListVariant {
    const Type: {
        readonly AliasVariant: "aliasVariant";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
