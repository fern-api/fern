import { ts } from "ts-morph";

export interface CallbackQueue {
    _instantiate: () => ts.NewExpression;
    wrap: (args: { referenceToCallbackQueue: ts.Expression; functionToWrap: ts.Expression }) => ts.Expression;
}
