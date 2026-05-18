export interface UnionTypeWithAliasMapVariant {
    type: UnionTypeWithAliasMapVariant.Type;
    value?: Record<string, unknown> | undefined;
}
export declare namespace UnionTypeWithAliasMapVariant {
    const Type: {
        readonly AliasVariant: "aliasVariant";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
