import { ts } from "ts-morph";

export interface Fetcher {
    readonly Fetcher: {
        Args: {
            _getReferenceToType: () => ts.TypeNode;
            properties: {
                url: "url";
                method: "method";
                headers: "headers";
                contentType: "contentType";
                queryParameters: "queryParameters";
                body: "body";
                abortSignal: "abortSignal";
                withCredentials: "withCredentials";
                timeoutInSeconds: "timeoutInSeconds";
                maxRetries: "maxRetries";
                requestType: "requestType";
                responseType: "responseType";
                duplex: "duplex";
                timeoutMs: "timeoutMs";
            };
        };
        Error: {
            _getReferenceToType: () => ts.TypeNode;
            reason: "reason";
        };
        FailedStatusCodeError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "status-code";
            statusCode: "statusCode";
            body: "body";
        };
        NonJsonError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "non-json";
            statusCode: "statusCode";
            rawBody: "rawBody";
        };
        TimeoutSdkError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "timeout";
        };
        UnknownError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: "unknown";
            message: "errorMessage";
        };
    };

    readonly fetcher: {
        _getReferenceTo: () => ts.Expression;
        _invoke: (
            args: Fetcher.Args,
            { referenceToFetcher, cast }: { referenceToFetcher: ts.Expression; cast: ts.TypeNode | undefined }
        ) => ts.Expression;
    };

    readonly APIResponse: {
        _getReferenceToType: (successType: ts.TypeNode, failureType: ts.TypeNode) => ts.TypeNode;

        ok: string;

        SuccessfulResponse: {
            _build: (
                body: ts.Expression,
                headers?: ts.Expression,
                rawResponse?: ts.Expression
            ) => ts.ObjectLiteralExpression;
            body: string;
            headers: string;
            rawResponse: string;
        };

        FailedResponse: {
            _build: (error: ts.Expression, rawResponse: ts.Expression) => ts.ObjectLiteralExpression;
            error: string;
            rawResponse: string;
        };
    };

    readonly Supplier: {
        _getReferenceToType: (suppliedType: ts.TypeNode) => ts.TypeNode;
        get: (supplier: ts.Expression) => ts.Expression;
    };

    readonly getHeader: {
        _invoke: (args: { referenceToResponseHeaders: ts.Expression; header: string }) => ts.Expression;
    };

    readonly FetchFunction: {
        _getReferenceToType: () => ts.TypeNode;
    };

    readonly RawResponse: {
        readonly RawResponse: {
            _getReferenceToType: () => ts.TypeNode;
        };
        readonly toRawResponse: {
            _getReferenceToType: () => ts.TypeNode;
        };
        readonly WithRawResponse: {
            _getReferenceToType: (typeArg?: ts.TypeNode) => ts.TypeNode;
        };
    };

    readonly HttpResponsePromise: {
        _getReferenceToType: (typeArg?: ts.TypeNode) => ts.TypeNode;
        fromPromise: (promise: ts.Expression) => ts.Expression;
        interceptFunction: (fn: ts.Expression) => ts.Expression;
    };
}

export declare namespace Fetcher {
    export interface Args {
        url: ts.Expression;
        method: ts.Expression;
        headers: ts.Expression;
        contentType?: string | ts.Expression;
        queryParameters: ts.Expression | undefined;
        body: ts.Expression | undefined;
        abortSignal: ts.Expression | undefined;
        withCredentials: boolean;
        timeoutInSeconds: ts.Expression;
        maxRetries?: ts.Expression;
        requestType?: "json" | "file" | "bytes" | "other";
        responseType?: "json" | "blob" | "sse" | "streaming" | "text";
        duplex?: ts.Expression;
    }
}
