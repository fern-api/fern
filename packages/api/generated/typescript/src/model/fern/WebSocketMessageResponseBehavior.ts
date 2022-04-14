export type WebSocketMessageResponseBehavior =
    | WebSocketMessageResponseBehavior.ONGOING
    | WebSocketMessageResponseBehavior.REQUEST_RESPONSE;

export const WebSocketMessageResponseBehavior = {
    ONGOING: "ONGOING" as WebSocketMessageResponseBehavior.ONGOING,
    REQUEST_RESPONSE: "REQUEST_RESPONSE" as WebSocketMessageResponseBehavior.REQUEST_RESPONSE,

    visit: <R>(value: WebSocketMessageResponseBehavior, visitor: WebSocketMessageResponseBehavior.Visitor<R>): R => {
        switch (value) {
            case WebSocketMessageResponseBehavior.ONGOING: return visitor.ONGOING();
            case WebSocketMessageResponseBehavior.REQUEST_RESPONSE: return visitor.REQUEST_RESPONSE();
            default: return visitor.unknown(value);
        }
    },
};

export declare namespace WebSocketMessageResponseBehavior {
    export type ONGOING = "ONGOING" & {
        "__fern.WebSocketMessageResponseBehavior": void,
    };
    export type REQUEST_RESPONSE = "REQUEST_RESPONSE" & {
        "__fern.WebSocketMessageResponseBehavior": void,
    };

    export interface Visitor<R> {
        ONGOING: () => R;
        REQUEST_RESPONSE: () => R;
        unknown: (value: string) => R;
    }
}
