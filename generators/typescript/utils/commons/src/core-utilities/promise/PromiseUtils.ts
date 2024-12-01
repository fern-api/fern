import { ts } from "ts-morph";

export interface PromiseUtils {
    readonly APIPromise: {
        _getReferenceToType: (response: ts.TypeNode) => ts.TypeNode;
        from: (statements: ts.Statement[]) => ts.Expression;
    };
}
