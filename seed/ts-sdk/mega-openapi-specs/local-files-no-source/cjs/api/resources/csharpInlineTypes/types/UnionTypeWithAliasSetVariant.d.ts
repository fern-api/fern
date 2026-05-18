export interface UnionTypeWithAliasSetVariant {
    type: UnionTypeWithAliasSetVariant.Type;
    value?: unknown[] | undefined;
}
export declare namespace UnionTypeWithAliasSetVariant {
    const Type: {
        readonly AliasVariant: "aliasVariant";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
