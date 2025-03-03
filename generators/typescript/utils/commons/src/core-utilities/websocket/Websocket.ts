import { ts } from "ts-morph";

export interface Websocket {
    readonly ReconnectingWebsocket: {
        _instantiate: (args: Websocket.Args) => ts.Expression;
    };
    // reconnecting logic here
}

export declare namespace Websocket {
    export interface Args {
        url: string;
        // headers: Record<string, string>;
        // queryParameters: Record<string, string>;
        // body: string;
        // maxRetries: number;
        // timeoutInSeconds: number;
    }
}
