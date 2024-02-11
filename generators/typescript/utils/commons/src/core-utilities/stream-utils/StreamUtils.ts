import { ts } from "ts-morph";

export interface StreamUtils {
    readonly Stream: {
        _construct: (args: { stream: ts.Expression; parse: ts.Expression; terminator: string }) => ts.Expression;
        _getReferenceToType: (response: ts.TypeNode) => ts.TypeNode;
    };
}

export declare namespace StreamingFetcher {
    export interface Args {
        url: ts.Expression;
        method: ts.Expression;
        headers: ts.ObjectLiteralElementLike[];
        queryParameters: ts.Expression | undefined;
        body: ts.Expression | undefined;
        timeoutInSeconds: ts.Expression;
        withCredentials: boolean;

        abortController: ts.Expression | undefined;
    }
}
