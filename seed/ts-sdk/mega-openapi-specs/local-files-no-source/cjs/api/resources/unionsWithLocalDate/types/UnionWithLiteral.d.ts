export interface UnionWithLiteral {
    type: UnionWithLiteral.Type;
    value?: UnionWithLiteral.Value | undefined;
}
export declare namespace UnionWithLiteral {
    const Type: {
        readonly Fern: "fern";
    };
    type Type = (typeof Type)[keyof typeof Type];
    const Value: {
        readonly Fern: "fern";
    };
    type Value = (typeof Value)[keyof typeof Value];
}
