import { ts } from "ts-morph";

export interface Fetcher {
    readonly Fetcher: {
        Args: { [Arg in keyof Fetcher.Args]-?: string };
        Error: {
            _getReferenceToType: () => ts.TypeNode;
            reason: string;
        };
        FailedStatusCodeError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: string;
            statusCode: string;
            body: string;
        };
        NonJsonError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: string;
            statusCode: string;
            rawBody: string;
        };
        TimeoutError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: string;
        };
        UnknownError: {
            _getReferenceToType: () => ts.TypeNode;
            _reasonLiteralValue: string;
            message: string;
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
