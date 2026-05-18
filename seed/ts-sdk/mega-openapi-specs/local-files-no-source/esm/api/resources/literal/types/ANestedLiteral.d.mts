export interface ANestedLiteral {
    myLiteral: ANestedLiteral.MyLiteral;
}
export declare namespace ANestedLiteral {
    const MyLiteral: {
        readonly HowSuperCool: "How super cool";
    };
    type MyLiteral = (typeof MyLiteral)[keyof typeof MyLiteral];
}
