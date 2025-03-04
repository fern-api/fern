import { ts } from "ts-morph";

export interface Websocket {
    readonly ReconnectingWebSocket: {
        _getReferenceToType: (itemType: ts.TypeNode) => ts.TypeNode;
        _connect: (args: {
            url: ts.Expression;
            protocols: ts.Expression;
            options: ts.ObjectLiteralExpression;
        }) => ts.Expression;
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
