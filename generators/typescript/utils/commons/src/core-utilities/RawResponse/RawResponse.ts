import { ts } from "ts-morph";

export interface RawResponse {
    readonly RawResponse: {
        _getReferenceToType: () => ts.TypeNode;
    };
    readonly toRawResponse: {
        _getReferenceToType: () => ts.TypeNode;
    };
    readonly WithRawResponse: {
        _getReferenceToType: (typeArg?: ts.TypeNode) => ts.TypeNode;
    };
    readonly HttpResponsePromise: {
        _getReferenceToType: (typeArg?: ts.TypeNode) => ts.TypeNode;
        fromFunction: (params: ts.Expression[]) => ts.Expression;
    };
}
