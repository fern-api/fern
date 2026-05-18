export declare const ObjectType: {
    readonly Foo: "FOO";
    readonly Bar: "BAR";
};
export type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];
