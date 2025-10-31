import type * as events from "./events";
import type * as ws from "./ws";

export type ReconnectingWebSocket = typeof ws.ReconnectingWebSocket;
export declare namespace ReconnectingWebSocket {
    export type Event = events.Event;
    export type CloseEvent = events.CloseEvent;
    export type ErrorEvent = events.ErrorEvent;
}
