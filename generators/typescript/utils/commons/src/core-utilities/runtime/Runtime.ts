import { ts } from "ts-morph";

export interface Runtime {
    readonly type: {
        _getReferenceTo: () => ts.Expression;
    };

    readonly version: {
        _getReferenceTo: () => ts.Expression;
    };
}
