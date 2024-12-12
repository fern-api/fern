import { Fetcher as ActualFetcher } from "@fern-typescript/fetcher";
import { ts } from "ts-morph";

export interface Fetcher {
    readonly Fetcher: {
        Args: {
            _getReferenceToType: () => ts.TypeNode;
            properties: { [Arg in keyof ActualFetcher.Args]-?: Arg };
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

    readonly RUNTIME: {
        type: {
            _getReferenceTo: () => ts.Expression;
        };
        version: {
            _getReferenceTo: () => ts.Expression;
        };
    };

    readonly APIResponse: {
        _getReferenceToType: (successType: ts.TypeNode, failureType: ts.TypeNode) => ts.TypeNode;

        ok: string;

        SuccessfulResponse: {
            _build: (body: ts.Expression) => ts.ObjectLiteralExpression;
            body: string;
            headers: string;
        };

        FailedResponse: {
            _build: (error: ts.Expression) => ts.ObjectLiteralExpression;
            error: string;
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
}

export declare namespace Fetcher {
    export interface Args {
        url: ts.Expression;
        method: ts.Expression;
        headers: ts.ObjectLiteralElementLike[];
        contentType?: string | ts.Expression;
        queryParameters: ts.Expression | undefined;
        body: ts.Expression | undefined;
        abortSignal: ts.Expression | undefined;
        withCredentials: boolean;
        timeoutInSeconds: ts.Expression;
        maxRetries?: ts.Expression;
        requestType?: "json" | "file" | "bytes" | "other";
        responseType?: "json" | "blob" | "sse" | "streaming" | "text" | "arrayBuffer";
        duplex?: ts.Expression;
    }
}
