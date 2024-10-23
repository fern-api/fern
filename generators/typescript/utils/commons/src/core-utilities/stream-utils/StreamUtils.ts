import { ts } from "ts-morph";

export interface StreamUtils {
    readonly Stream: {
        _construct: (args: {
            stream: ts.Expression;
            parse: ts.Expression;
            eventShape: StreamingFetcher.SSEEventShape | StreamingFetcher.MessageEventShape;
            signal: ts.Expression;
        }) => ts.Expression;
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

    export interface SSEEventShape {
        type: "sse";
        streamTerminator?: ts.Expression;
    }

    export interface MessageEventShape {
        type: "json";
        messageTerminator?: ts.Expression;
    }
}
