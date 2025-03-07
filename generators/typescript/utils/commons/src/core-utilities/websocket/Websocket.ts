import { ts } from "ts-morph";

export interface Websocket {
    readonly ReconnectingWebSocket: {
        _getReferenceToType: () => ts.TypeNode;
        _connect: (args: {
            url: ts.Expression;
            protocols: ts.Expression;
            options: ts.ObjectLiteralExpression;
            headers: ts.Expression;
        }) => ts.Expression;
    };
    readonly CloseEvent: {
        _getReferenceToType: () => ts.TypeNode;
    };
    readonly ErrorEvent: {
        _getReferenceToType: () => ts.TypeNode;
    };
}

export declare namespace Websocket {
    export interface Args {
        url: string;
        headers: Record<string, string>;
        queryParameters: Record<string, string>;
        body: string;
        maxRetries: number;
        timeoutInSeconds: number;
    }
}
