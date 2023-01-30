import { ts } from "ts-morph";

export interface Fetcher {
    readonly Fetcher: {
        Args: { [Arg in keyof Fetcher.Args]-?: string };
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

        _invoke: (args: Fetcher.Args) => ts.Expression;
    };

    readonly APIResponse: {
        _getReferenceToType: (successType: ts.TypeNode, failureType: ts.TypeNode) => ts.TypeNode;

        ok: string;

        SuccessfulResponse: {
            _build: (body: ts.Expression) => ts.ObjectLiteralExpression;
            body: string;
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
}

export declare namespace Fetcher {
    export interface Args {
        url: ts.Expression;
        method: ts.Expression;
        headers: ts.ObjectLiteralElementLike[];
        queryParameters: ts.Expression | undefined;
        body: ts.Expression | undefined;
        timeoutMs: ts.Expression | undefined;
    }
}
