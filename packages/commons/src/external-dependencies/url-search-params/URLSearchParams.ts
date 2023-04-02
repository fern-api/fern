import { ts } from "ts-morph";

export interface URLSearchParams {
    instantiate: () => ts.Expression;
    append: (args: {
        key: ts.Expression;
        value: ts.Expression;
        referenceToUrlSearchParams: ts.Expression;
    }) => ts.Expression;
}
