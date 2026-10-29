export class Event {
    public target: any;
    public type: string;
    constructor(type: string, target: any) {
        this.target = target;
        this.type = type;
    }
}

/** Details of a rejected WebSocket handshake (a non-101 response). Only available in Node. */
export interface HandshakeRejection {
    statusCode?: number;
    headers: Record<string, string>;
    body: string;
}

export class ErrorEvent extends Event {
    public message: string;
    public error: Error;
    /** HTTP status of a rejected handshake (Node only). */
    public statusCode?: number;
    /** Response headers of a rejected handshake (Node only). */
    public headers?: Record<string, string>;
    /** Response body of a rejected handshake, capped at 1000 characters (Node only). */
    public body?: string;
    constructor(error: Error, target: any, handshakeRejection?: HandshakeRejection) {
        super("error", target);
        this.message = error.message;
        this.error = error;
        if (handshakeRejection != null) {
            this.statusCode = handshakeRejection.statusCode;
            this.headers = handshakeRejection.headers;
            this.body = handshakeRejection.body;
        }
    }
}

export class CloseEvent extends Event {
    public code: number;
    public reason: string;
    public wasClean = true;
    constructor(code = 1000, reason = "", target: any) {
        super("close", target);
        this.code = code;
        this.reason = reason;
    }
}
export interface WebSocketEventMap {
    close: CloseEvent;
    error: ErrorEvent;
    message: MessageEvent;
    open: Event;
}

export interface WebSocketEventListenerMap {
    close: (event: CloseEvent) => void | { handleEvent: (event: CloseEvent) => void };
    error: (event: ErrorEvent) => void | { handleEvent: (event: ErrorEvent) => void };
    message: (event: MessageEvent) => void | { handleEvent: (event: MessageEvent) => void };
    open: (event: Event) => void | { handleEvent: (event: Event) => void };
}
