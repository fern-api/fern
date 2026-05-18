export interface NestedObjectWithLiterals {
    literal1: NestedObjectWithLiterals.Literal1;
    literal2: NestedObjectWithLiterals.Literal2;
    strProp: string;
}
export declare namespace NestedObjectWithLiterals {
    const Literal1: {
        readonly Literal1: "literal1";
    };
    type Literal1 = (typeof Literal1)[keyof typeof Literal1];
    const Literal2: {
        readonly Literal2: "literal2";
    };
    type Literal2 = (typeof Literal2)[keyof typeof Literal2];
}
