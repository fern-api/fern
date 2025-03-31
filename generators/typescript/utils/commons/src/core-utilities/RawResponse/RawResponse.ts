import { ts } from "ts-morph";

export interface RawResponse {
    readonly RawResponse: {
        _getReferenceToType: () => ts.TypeNode;
    };
    readonly toRawResponse: {
        _getReferenceToType: () => ts.TypeNode;
    };
    readonly WithRawResponse: {
        _getReferenceToType: () => ts.TypeNode;
        create: (typeArgs: ts.TypeNode[]) => ts.Node;
    };
}