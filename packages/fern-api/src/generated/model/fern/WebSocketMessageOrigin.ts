export type WebSocketMessageOrigin =
    | WebSocketMessageOrigin.CLIENT
    | WebSocketMessageOrigin.SERVER;

export const WebSocketMessageOrigin = {
    CLIENT: "CLIENT" as WebSocketMessageOrigin.CLIENT,
    SERVER: "SERVER" as WebSocketMessageOrigin.SERVER,

    visit: <R>(value: WebSocketMessageOrigin, visitor: WebSocketMessageOrigin.Visitor<R>) => {
        switch (value) {
            case WebSocketMessageOrigin.CLIENT: return visitor.CLIENT();
            case WebSocketMessageOrigin.SERVER: return visitor.SERVER();
            default: return visitor.unknown(value);
        }
    },
};

export declare namespace WebSocketMessageOrigin {
    export type CLIENT = "CLIENT" & {
        "__fern.WebSocketMessageOrigin": void,
    };
    export type SERVER = "SERVER" & {
        "__fern.WebSocketMessageOrigin": void,
    };

    export interface Visitor<R> {
        CLIENT: () => R;
        SERVER: () => R;
        unknown: (value: string) => R;
    }
}
