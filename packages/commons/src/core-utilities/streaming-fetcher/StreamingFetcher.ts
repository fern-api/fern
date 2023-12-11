import { StreamingFetcher as ActualStreamingFetcher } from "@fern-typescript/streaming-fetcher";
import { ts } from "ts-morph";

export interface StreamingFetcher {
    readonly StreamingFetcher: {
        Args: {
            properties: { [Arg in keyof ActualStreamingFetcher.Args]-?: Arg };
            _getReferenceToType: () => ts.TypeNode;
        };

        Response: {
            properties: { [Key in keyof ActualStreamingFetcher.Response]-?: Key };
            _getReferenceToType: () => ts.TypeNode;
        };
    };

    readonly streamingFetcher: {
        _getReferenceTo: () => ts.Expression;
        _invoke: (
            args: StreamingFetcher.Args,
            opts: {
                referenceToFetcher: ts.Expression;
            }
        ) => ts.Expression;
    };

    readonly StreamingFetchFunction: {
        _getReferenceToType: () => ts.TypeNode;
    };

    readonly getHeader: {
        _invoke: (args: { referenceToRequest: ts.Expression; header: string }) => ts.Expression;
    };

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
