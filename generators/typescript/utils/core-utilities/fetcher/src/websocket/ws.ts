import { WebSocket as NodeWebSocket } from "ws";

import { Supplier } from "../fetcher";
import { RUNTIME } from "../runtime";
import * as Events from "./events";

const ABNORMAL_CLOSURE_CODE = 1006;

const getGlobalWebSocket = (): WebSocket | undefined => {
    if (typeof WebSocket !== "undefined") {
        // @ts-ignore
        return WebSocket;
    } else if (RUNTIME.type === "node") {
        return NodeWebSocket as unknown as WebSocket;
    }
    return undefined;
};

/**
 * Returns true if given argument looks like a WebSocket class
 */
const isWebSocket = (w: any) => typeof w !== "undefined" && !!w && w.CLOSING === 2;

export type Event = Events.Event;
export type ErrorEvent = Events.ErrorEvent;
export type CloseEvent = Events.CloseEvent;

export type Options = {
    WebSocket?: any;
    maxReconnectionDelay?: number;
    minReconnectionDelay?: number;
    reconnectionDelayGrowFactor?: number;
    minUptime?: number;
    connectionTimeout?: number;
    maxRetries?: number;
    maxEnqueuedMessages?: number;
    startClosed?: boolean;
    debug?: boolean;
};

const DEFAULT = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000 + Math.random() * 4000,
    minUptime: 5000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 4000,
    maxRetries: Infinity,
    maxEnqueuedMessages: Infinity,
    startClosed: false,
    debug: false
};

export type UrlProvider = string | (() => string) | (() => Promise<string>);

export type Message = string | ArrayBuffer | Blob | ArrayBufferView;

export type ListenersMap = {
    error: Array<Events.WebSocketEventListenerMap["error"]>;
    message: Array<Events.WebSocketEventListenerMap["message"]>;
    open: Array<Events.WebSocketEventListenerMap["open"]>;
    close: Array<Events.WebSocketEventListenerMap["close"]>;
};

export type WebSocketLike = typeof WebSocket extends { new (...args: any): infer W } ? W : never;
export type WebSocketFactory = <Options extends { apiKey: Supplier<string> }>(
    url: string,
    options: Options
) => Promise<WebSocketLike>;
export type WebSocketClientOptions = Record<string, unknown> & {
    apiKey: Supplier<string>;
    protocols?: string[];
    headers?: Record<string, unknown>;
};

export class ReconnectingWebSocket {
    private _ws?: WebSocket;
    private _listeners: ListenersMap = {
        error: [],
        message: [],
        open: [],
        close: []
    };
    private _retryCount = -1;
    private _uptimeTimeout: any;
    private _connectTimeout: any;
    private _shouldReconnect = true;
    private _connectLock = false;
    private _binaryType: BinaryType = "blob";
    private _closeCalled = false;
    private _messageQueue: Message[] = [];

    private readonly _websocketFactory: WebSocketFactory;
    private readonly _url: UrlProvider;
    private readonly _options: Options;
    private readonly _clientOptions: WebSocketClientOptions;
    constructor(
        websocketFactory: WebSocketFactory,
        url: UrlProvider,
        clientOptions: WebSocketClientOptions,
        options: Options
    ) {
        this._websocketFactory = websocketFactory;
        this._url = url;
        this._clientOptions = clientOptions;
        this._options = options;
        if (this._options.startClosed) {
            this._shouldReconnect = false;
        }
        this._connect();
    }

    static get CONNECTING() {
        return 0;
    }
    static get OPEN() {
        return 1;
    }
    static get CLOSING() {
        return 2;
    }
    static get CLOSED() {
        return 3;
    }

    get CONNECTING() {
        return ReconnectingWebSocket.CONNECTING;
    }
    get OPEN() {
        return ReconnectingWebSocket.OPEN;
    }
    get CLOSING() {
        return ReconnectingWebSocket.CLOSING;
    }
    get CLOSED() {
        return ReconnectingWebSocket.CLOSED;
    }

    get binaryType() {
        return this._ws ? this._ws.binaryType : this._binaryType;
    }

    set binaryType(value: BinaryType) {
        this._binaryType = value;
        if (this._ws) {
            this._ws.binaryType = value;
        }
    }

    /**
     * Returns the number or connection retries
     */
    get retryCount(): number {
        return Math.max(this._retryCount, 0);
    }

    /**
     * The number of bytes of data that have been queued using calls to send() but not yet
     * transmitted to the network. This value resets to zero once all queued data has been sent.
     * This value does not reset to zero when the connection is closed; if you keep calling send(),
     * this will continue to climb. Read only
     */
    get bufferedAmount(): number {
        const bytes = this._messageQueue.reduce((acc, message) => {
            if (typeof message === "string") {
                acc += message.length; // not byte size
            } else if (message instanceof Blob) {
                acc += message.size;
            } else {
                acc += message.byteLength;
            }
            return acc;
        }, 0);
        return bytes + (this._ws ? this._ws.bufferedAmount : 0);
    }

    /**
     * The extensions selected by the server. This is currently only the empty string or a list of
     * extensions as negotiated by the connection
     */
    get extensions(): string {
        return this._ws ? this._ws.extensions : "";
    }

    /**
     * A string indicating the name of the sub-protocol the server selected;
     * this will be one of the strings specified in the protocols parameter when creating the
     * WebSocket object
     */
    get protocol(): string {
        return this._ws ? this._ws.protocol : "";
    }

    /**
     * The current state of the connection; this is one of the Ready state constants
     */
    get readyState(): number {
        if (this._ws) {
            return this._ws.readyState;
        }
        return this._options.startClosed ? ReconnectingWebSocket.CLOSED : ReconnectingWebSocket.CONNECTING;
    }

    /**
     * The URL as resolved by the constructor
     */
    get url(): string {
        return this._ws ? this._ws.url : "";
    }

    /**
     * An event listener to be called when the WebSocket connection's readyState changes to CLOSED
     */
    public onclose: ((event: Events.CloseEvent) => void) | null = null;

    /**
     * An event listener to be called when an error occurs
     */
    public onerror: ((event: Events.ErrorEvent) => void) | null = null;

    /**
     * An event listener to be called when a message is received from the server
     */
    public onmessage: ((event: MessageEvent) => void) | null = null;

    /**
     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
     * this indicates that the connection is ready to send and receive data
     */
    public onopen: ((event: Event) => void) | null = null;

    /**
     * Closes the WebSocket connection or connection attempt, if any. If the connection is already
     * CLOSED, this method does nothing
     */
    public close(code = 1000, reason?: string) {
        this._closeCalled = true;
        this._shouldReconnect = false;
        this._clearTimeouts();
        if (!this._ws) {
            this._debug("close enqueued: no ws instance");
            return;
        }
        if (this._ws.readyState === this.CLOSED) {
            this._debug("close: already closed");
            return;
        }
        this._ws.close(code, reason);
    }

    /**
     * Closes the WebSocket connection or connection attempt and connects again.
     * Resets retry counter;
     */
    public reconnect(code?: number, reason?: string) {
        this._shouldReconnect = true;
        this._closeCalled = false;
        this._retryCount = -1;
        if (!this._ws || this._ws.readyState === this.CLOSED) {
            this._connect();
        } else {
            this._disconnect(code, reason);
            this._connect();
        }
    }

    /**
     * Enqueue specified data to be transmitted to the server over the WebSocket connection
     */
    public send(data: Message) {
        if (this._ws && this._ws.readyState === this.OPEN) {
            this._debug("send", data);
            this._ws.send(data);
        } else {
            const { maxEnqueuedMessages = DEFAULT.maxEnqueuedMessages } = this._options;
            if (this._messageQueue.length < maxEnqueuedMessages) {
                this._debug("enqueue", data);
                this._messageQueue.push(data);
            }
        }
    }

    /**
     * Register an event handler of a specific event type
     */
    public addEventListener<T extends keyof Events.WebSocketEventListenerMap>(
        type: T,
        listener: Events.WebSocketEventListenerMap[T]
    ): void {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type].push(listener);
        }
    }

    public dispatchEvent(event: Event) {
        const listeners = this._listeners[event.type as keyof Events.WebSocketEventListenerMap];
        if (listeners) {
            for (const listener of listeners) {
                this._callEventListener(event, listener);
            }
        }
        return true;
    }

    /**
     * Removes an event listener
     */
    public removeEventListener<T extends keyof Events.WebSocketEventListenerMap>(
        type: T,
        listener: Events.WebSocketEventListenerMap[T]
    ): void {
        if (this._listeners[type]) {
            // @ts-ignore
            this._listeners[type] = this._listeners[type].filter(
                // @ts-ignore
                (l) => l !== listener
            );
        }
    }

    private _debug(...args: any[]) {
        if (this._options.debug) {
            // not using spread because compiled version uses Symbols
            // tslint:disable-next-line
            // eslint-disable-next-line no-console
            console.log.apply(console, ["RWS>", ...args]);
        }
    }

    private _shutdown(error: Error, ...args: any[]) {
        this._debug("shutting down:", error.message, ...args);

        // Ensure state prevents further attempts
        this._connectLock = false;
        this._shouldReconnect = false;

        // Dispatch error event
        const errorEvent = this._adaptError(error);
        if (this.onerror) {this.onerror(errorEvent);}
        this._listeners.error.forEach((listener) => this._callEventListener(errorEvent, listener));

        // Dispatch close event
        const closeEvent = new Events.CloseEvent(1000, error.message, this);

        if (this.onclose) {this.onclose(closeEvent);}
        this._listeners.close.forEach((listener) => this._callEventListener(closeEvent, listener));
    }

    private _getNextDelay() {
        const {
            reconnectionDelayGrowFactor = DEFAULT.reconnectionDelayGrowFactor,
            minReconnectionDelay = DEFAULT.minReconnectionDelay,
            maxReconnectionDelay = DEFAULT.maxReconnectionDelay
        } = this._options;
        let delay = 0;
        if (this._retryCount > 0) {
            delay = minReconnectionDelay * Math.pow(reconnectionDelayGrowFactor, this._retryCount - 1);
            if (delay > maxReconnectionDelay) {
                delay = maxReconnectionDelay;
            }
        }
        this._debug("next delay", delay);
        return delay;
    }

    private _wait(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, this._getNextDelay());
        });
    }

    private _getNextUrl(urlProvider: UrlProvider): Promise<string> {
        if (typeof urlProvider === "string") {
            return Promise.resolve(urlProvider);
        }
        if (typeof urlProvider === "function") {
            const url = urlProvider();
            if (typeof url === "string") {
                return Promise.resolve(url);
            }
            // @ts-ignore redundant check
            if (url.then) {
                return url;
            }
        }
        throw Error("Invalid URL");
    }

    private _connect() {
        // Check locks and intent
        if (this._connectLock) {
            this._debug("connection attempt already in progress.");
            return;
        }
        if (!this._shouldReconnect) {
            this._debug("reconnection disabled, skipping connect attempt.");
            return;
        }

        // Set lock for this attempt
        this._connectLock = true;

        const {
            maxRetries = DEFAULT.maxRetries,
            connectionTimeout = DEFAULT.connectionTimeout,
            WebSocket = getGlobalWebSocket()
        } = this._options;

        // max retries reached
        if (this._retryCount >= maxRetries) {
            this._shutdown(new Error(`max retries (${maxRetries}) reached`), this._retryCount, ">=", maxRetries);
            return;
        }

        // prepare connection attempt
        this._retryCount++;
        this._debug("connect", this._retryCount);
        this._removeListeners();

        if (!this._websocketFactory) {
            throw Error("no valid websocket factory provided");
        }

        this._wait()
            .then(() => this._getNextUrl(this._url))
            .then(async (url) => {
                // Close could be called before creating the ws
                if (this._closeCalled) {
                    this._connectLock = false;
                    this._debug("Connection cancelled: ReconnectingWebSocket.close() called during setup.");
                    return;
                }

                this._debug("create websocket from factory", { url, clientOptions: this._clientOptions });
                this._ws = await this._websocketFactory(url, this._clientOptions);
                this._ws!.binaryType = this._binaryType;

                this._connectLock = false;
                this._addListeners();

                this._connectTimeout = setTimeout(() => this._handleTimeout(), connectionTimeout);
            })
            .catch((error: any) => {
                this._debug("connection setup failed", error);
                this._connectLock = false;
                this._handleError(error);
            });
    }

    private _handleTimeout() {
        this._debug("timeout event");
        this._handleError(new Events.ErrorEvent(Error("TIMEOUT"), this));
    }

    private _disconnect(code = 1000, reason?: string) {
        this._clearTimeouts();
        if (!this._ws) {
            return;
        }
        this._removeListeners();
        try {
            this._ws.close(code, reason);
            this._handleClose(new Events.CloseEvent(code, reason, this));
        } catch (error) {
            // ignore
        }
    }

    private _acceptOpen() {
        this._debug("accept open");
        this._retryCount = 0;
    }

    private _callEventListener<T extends keyof Events.WebSocketEventListenerMap>(
        event: Events.WebSocketEventMap[T],
        listener: Events.WebSocketEventListenerMap[T]
    ) {
        if ("handleEvent" in listener) {
            // @ts-ignore
            listener.handleEvent(event);
        } else {
            // @ts-ignore
            listener(event);
        }
    }

    private _handleOpen = (event: Event) => {
        this._debug("open event");
        const { minUptime = DEFAULT.minUptime } = this._options;

        clearTimeout(this._connectTimeout);
        this._uptimeTimeout = setTimeout(() => this._acceptOpen(), minUptime);

        this._ws!.binaryType = this._binaryType;

        // send enqueued messages (messages sent before websocket open event)
        this._messageQueue.forEach((message) => this._ws?.send(message));
        this._messageQueue = [];

        if (this.onopen) {
            this.onopen(event);
        }
        this._listeners.open.forEach((listener) => this._callEventListener(event, listener));
    };

    private _handleMessage = (event: MessageEvent) => {
        this._debug("message event");

        if (this.onmessage) {
            this.onmessage(event);
        }
        this._listeners.message.forEach((listener) => this._callEventListener(event, listener));
    };

    /**
     * Adapts a raw error or event input into a standardized `Events.ErrorEvent`.
     * This utility is called by `_handleError` to ensure it operates on a
     * consistent error structure.
     * @param rawErrorOrEventInput - The raw error data (e.g., Error instance, DOM Event, Events.ErrorEvent).
     * @returns A standardized `Events.ErrorEvent` containing an underlying `Error` instance.
     */
    private _adaptError(rawErrorOrEventInput: unknown): Events.ErrorEvent {
        this._debug("adapting raw error or event via _adaptError", rawErrorOrEventInput);
        let underlyingError: Error;

        if (rawErrorOrEventInput instanceof Events.ErrorEvent && rawErrorOrEventInput.error instanceof Error) {
            return rawErrorOrEventInput;
        }

        if (rawErrorOrEventInput instanceof Error) {
            underlyingError = rawErrorOrEventInput;
        } else if (
            typeof Event !== "undefined" &&
            rawErrorOrEventInput instanceof Event &&
            rawErrorOrEventInput.type === "error"
        ) {
            underlyingError = new Error(
                "websocket low-level error occurred: see browser/runtime console for native event details"
            );
        } else {
            underlyingError = new Error(
                `unknown WebSocket error. raw data: ${String(rawErrorOrEventInput ?? "undefined")}`
            );
        }

        return new Events.ErrorEvent(underlyingError, this);
    }

    /**
     * Core handler for all errors. It first standardizes the error input using `_adaptError`,
     * then manages disconnection, dispatches the standardized error event, and initiates reconnection.
     * @param rawErrorOrEventInput - The error data from any internal source.
     */
    private _handleError = (rawErrorOrEventInput: any): void => {
        this._debug("raw error or event received by _handleError", rawErrorOrEventInput);

        const adaptedError = this._adaptError(rawErrorOrEventInput);
        const { error, message } = adaptedError;

        // Close with abnormal closure code so _handleClose will reconnect if there's a socket
        this._disconnect(ABNORMAL_CLOSURE_CODE, message);

        this._debug("processed error; dispatching event", message, error);
        if (this.onerror) {this.onerror(adaptedError);}

        this._debug("exec error listeners");
        this._listeners.error.forEach((listener) => this._callEventListener(adaptedError, listener));

        // If we never even got a ws instance, _disconnect returned early so we need to explicitly retry here
        if (!this._ws && this._shouldReconnect) {
            this._debug("error before socket created; scheduling initial reconnect");
            this._connect();
        }
    };

    /**
     * Handles WebSocket close events, either native or synthesized internally.
     *
     * Adapts the event if necessary, manages state, dispatches standardized close events,
     * and initiates reconnection if appropriate.
     *
     * @param eventInfo - Either an internal Events.CloseEvent or a native DOM CloseEvent.
     */
    private _handleClose = (event: Events.CloseEvent | CloseEvent) => {
        this._debug("close event received by _handleClose", event);

        // Adapt event if event is an instance of the (browser) native CloseEvent
        const isNativeCloseEvent = typeof CloseEvent !== "undefined" && event instanceof CloseEvent;
        const adaptedEvent: Events.CloseEvent = isNativeCloseEvent
            ? new Events.CloseEvent(event.code, event.reason, this)
            : (event as Events.CloseEvent);

        // Clean up state
        this._clearTimeouts();
        this._ws = undefined;
        this._connectLock = false;

        // Determine reconnection intent
        if (this._closeCalled) {
            this._shouldReconnect = false;
            this._debug("reconnection stopped intentionally", "_closeCalled", this._closeCalled);
        } else if (adaptedEvent.code === 1000) {
            this._shouldReconnect = false;
            this._debug("reconnection stopped intentionally", "close code", adaptedEvent.code);
        }

        // Dispatch event to listeners
        if (this.onclose) {this.onclose(adaptedEvent);}
        this._listeners.close.forEach((listener) => this._callEventListener(adaptedEvent, listener));

        // Conditionally attempt reconnection
        if (this._shouldReconnect) {this._connect();}
    };

    private _removeListeners() {
        if (!this._ws) {
            return;
        }
        this._debug("removeListeners");
        this._ws.removeEventListener("open", this._handleOpen);
        this._ws.removeEventListener("close", this._handleClose);
        this._ws.removeEventListener("message", this._handleMessage);
        // @ts-ignore
        this._ws.removeEventListener("error", this._handleError);
    }

    private _addListeners() {
        if (!this._ws) {
            return;
        }
        this._debug("addListeners");
        this._ws.addEventListener("open", this._handleOpen);
        this._ws.addEventListener("close", this._handleClose);
        this._ws.addEventListener("message", this._handleMessage);
        this._ws.addEventListener("error", this._handleError);
    }

    private _clearTimeouts() {
        clearTimeout(this._connectTimeout);
        clearTimeout(this._uptimeTimeout);
    }
}
