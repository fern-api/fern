import { ts } from "ts-morph";

export interface Utils {
    readonly setObjectProperty: {
        _invoke: (args: { referenceToObject: ts.Expression; path: string; value: ts.Expression }) => ts.Expression;
    };
}
