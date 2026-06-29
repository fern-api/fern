import { WebSocket as NodeWebSocket } from "ws";

import { RUNTIME } from "../runtime/index.js";
import { GraphqlError, type GraphqlResponseError } from "./GraphqlError.js";

/**
 * The `graphql-transport-ws` subprotocol identifier (the modern `graphql-ws` protocol). Sent as the
 * WebSocket subprotocol so the server negotiates the correct message framing.
 */
const GRAPHQL_TRANSPORT_WS_PROTOCOL = "graphql-transport-ws";

/**
 * Fixed operation id used for the single subscription multiplexed over the socket. Each generated
 * subscription method opens its own socket, so a constant id is sufficient.
 */
const SUBSCRIPTION_ID = "1";

/**
 * Resolves the WebSocket constructor for the current runtime, mirroring `getGlobalWebSocket()` in
 * `../websocket/ws`: the `ws` package on node/bun/deno, the global `WebSocket` in the browser.
 */
function getGlobalWebSocket(): WebSocketConstructor | undefined {
    if (RUNTIME.type === "node" || RUNTIME.type === "bun" || RUNTIME.type === "deno") {
        return NodeWebSocket as unknown as WebSocketConstructor;
    } else if (typeof WebSocket !== "undefined") {
        return WebSocket as unknown as WebSocketConstructor;
    }
    return undefined;
}

/**
 * Minimal structural type for a WebSocket constructor that accepts a subprotocol and (on node `ws`)
 * an options object carrying upgrade-request headers. Both the browser `WebSocket` and the node `ws`
 * constructor satisfy this shape; the browser ignores the extra options argument.
 */
type WebSocketConstructor = new (
    url: string,
    protocols?: string | string[],
    options?: { headers?: Record<string, unknown> },
) => WebSocketLike;

/**
 * A value, or a (possibly async) supplier of it. Suppliers let auth-derived values be resolved
 * lazily on first iteration — so the generated subscription method can stay synchronous (returning
 * the iterable directly) even when resolving auth requires an `await`.
 */
type MaybeSupplier<T> = T | (() => T | Promise<T>);

function resolveMaybe<T>(value: MaybeSupplier<T> | undefined): Promise<T | undefined> {
    return Promise.resolve(typeof value === "function" ? (value as () => T | Promise<T>)() : value);
}

/**
 * Minimal structural surface of a WebSocket instance used by this helper. Compatible with both the
 * browser `WebSocket` and the node `ws` socket (which exposes the same event-handler properties).
 */
interface WebSocketLike {
    send(data: string): void;
    close(code?: number, reason?: string): void;
    onopen: ((event: unknown) => void) | null;
    onmessage: ((event: { data: unknown }) => void) | null;
    onerror: ((event: unknown) => void) | null;
    onclose: ((event: unknown) => void) | null;
}

export interface SubscribeGraphqlArgs {
    /**
     * The WebSocket endpoint url, or a (possibly async) supplier of it. A supplier lets the socket
     * url be resolved lazily on first iteration, so the generated subscription method can stay
     * synchronous (returning the iterable directly) even when the base url is async.
     */
    url: string | (() => string | Promise<string>);
    query: string;
    variables?: Record<string, unknown>;
    operationName: string;
    /**
     * Payload sent in the `connection_init` message (conventionally used for auth). May be a
     * (possibly async) supplier so auth headers are resolved lazily on first iteration.
     */
    connectionParams?: MaybeSupplier<Record<string, unknown>>;
    /**
     * Headers applied to the WebSocket upgrade request, for servers that authenticate on upgrade.
     * May be a (possibly async) supplier so auth headers are resolved lazily on first iteration.
     */
    headers?: MaybeSupplier<Record<string, unknown>>;
    abortSignal?: AbortSignal;
    /** Optional WebSocket constructor override (e.g. for testing or custom runtimes). */
    WebSocket?: unknown;
}

/** A `graphql-transport-ws` server-to-client `next` message carrying a single execution result. */
interface NextMessage {
    type: "next";
    id: string;
    payload: {
        data?: Record<string, unknown> | null;
        errors?: GraphqlResponseError[];
    };
}

/** A `graphql-transport-ws` server acknowledgement of the `connection_init` handshake. */
interface ConnectionAckMessage {
    type: "connection_ack";
}

/** A `graphql-transport-ws` `complete` message signalling the subscription has ended. */
interface CompleteMessage {
    type: "complete";
    id?: string;
}

/** A `graphql-transport-ws` `error` message; the payload is an array of GraphQL errors. */
interface ErrorMessage {
    type: "error";
    id?: string;
    payload: GraphqlResponseError[];
}

/** A keep-alive ping; servers may send these and expect a `pong` in reply. */
interface PingMessage {
    type: "ping";
    payload?: Record<string, unknown>;
}

type ServerMessage = NextMessage | ConnectionAckMessage | CompleteMessage | ErrorMessage | PingMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isServerMessage(value: unknown): value is ServerMessage {
    return isRecord(value) && typeof value.type === "string";
}

function isGraphqlErrorArray(value: unknown): value is GraphqlResponseError[] {
    return Array.isArray(value);
}

function parseMessage(raw: unknown): ServerMessage | undefined {
    let text: string;
    if (typeof raw === "string") {
        text = raw;
    } else if (raw instanceof ArrayBuffer) {
        text = new TextDecoder().decode(raw);
    } else if (ArrayBuffer.isView(raw)) {
        text = new TextDecoder().decode(raw.buffer);
    } else {
        return undefined;
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        return undefined;
    }
    return isServerMessage(parsed) ? parsed : undefined;
}

/**
 * Opens a GraphQL subscription over a WebSocket using the `graphql-transport-ws` subprotocol and
 * returns an `AsyncIterableIterator` that yields the unwrapped `data[operationName]` payload of each
 * server `next` message. Iteration ends on `complete` or socket close; GraphQL `errors` (in a `next`
 * payload or an `error` message) are thrown as a {@link GraphqlError}, and socket-level failures are
 * thrown as an `Error`.
 *
 * Breaking out of a `for await` loop (or calling `.return()`/`.throw()` on the iterator) tears down
 * the underlying socket, and passing an aborted `abortSignal` sends a `complete` and closes the socket.
 */
export function subscribeGraphql<T>(args: SubscribeGraphqlArgs): AsyncIterableIterator<T> {
    const { url, query, variables, operationName, abortSignal } = args;

    const WebSocketCtor: WebSocketConstructor | undefined =
        (args.WebSocket as WebSocketConstructor | undefined) ?? getGlobalWebSocket();
    if (WebSocketCtor == null) {
        throw new Error("No WebSocket implementation available in this environment.");
    }

    // Push/pull queue bridging socket event callbacks to the async generator. `pending` holds values
    // received before the consumer asked for them; `waiting` holds consumer requests that arrived
    // before a value did. At most one of the two is ever non-empty.
    const pending: Array<IteratorResult<T>> = [];
    const waiting: Array<{
        resolve: (result: IteratorResult<T>) => void;
        reject: (error: unknown) => void;
    }> = [];
    let terminalError: unknown;
    let finished = false;
    let started = false;
    let socket: WebSocketLike | undefined;
    // Resolved lazily in start() (auth headers may require an async lookup), then sent in connection_init.
    let resolvedConnectionParams: Record<string, unknown> = {};

    const closeSocket = (): void => {
        if (socket == null) {
            return;
        }
        try {
            socket.close();
        } catch {
            // The socket may already be closing/closed; closing is best-effort during teardown.
        }
    };

    const pushValue = (value: T): void => {
        const next = waiting.shift();
        if (next != null) {
            next.resolve({ value, done: false });
        } else {
            pending.push({ value, done: false });
        }
    };

    const finish = (): void => {
        if (finished) {
            return;
        }
        finished = true;
        for (const waiter of waiting.splice(0)) {
            waiter.resolve({ value: undefined, done: true });
        }
        closeSocket();
    };

    const fail = (error: unknown): void => {
        if (finished) {
            return;
        }
        finished = true;
        terminalError = error;
        for (const waiter of waiting.splice(0)) {
            waiter.reject(error);
        }
        closeSocket();
    };

    const onAbort = (): void => {
        try {
            socket?.send(JSON.stringify({ type: "complete", id: SUBSCRIPTION_ID }));
        } catch {
            // Best-effort: the socket may not be open. Teardown proceeds regardless.
        }
        finish();
    };

    const attachHandlers = (activeSocket: WebSocketLike): void => {
        activeSocket.onopen = (): void => {
            activeSocket.send(JSON.stringify({ type: "connection_init", payload: resolvedConnectionParams }));
        };

        activeSocket.onmessage = (event: { data: unknown }): void => {
            const message = parseMessage(event.data);
            if (message == null) {
                return;
            }
            switch (message.type) {
                case "connection_ack":
                    activeSocket.send(
                        JSON.stringify({
                            type: "subscribe",
                            id: SUBSCRIPTION_ID,
                            payload: { query, variables: variables ?? {}, operationName },
                        }),
                    );
                    return;
                case "ping":
                    activeSocket.send(JSON.stringify({ type: "pong", payload: message.payload ?? {} }));
                    return;
                case "next": {
                    const errors = message.payload.errors;
                    if (errors != null && errors.length > 0) {
                        fail(new GraphqlError({ errors, data: message.payload.data ?? undefined }));
                        return;
                    }
                    const value = message.payload.data?.[operationName] as T;
                    pushValue(value);
                    return;
                }
                case "error": {
                    const errors = isGraphqlErrorArray(message.payload) ? message.payload : [];
                    fail(new GraphqlError({ errors }));
                    return;
                }
                case "complete":
                    finish();
                    return;
                default:
                    // Forward-compatible: ignore unrecognized message types rather than failing the stream.
                    return;
            }
        };

        activeSocket.onerror = (): void => {
            fail(new Error("GraphQL subscription socket error."));
        };

        activeSocket.onclose = (): void => {
            finish();
        };
    };

    // Lazily resolve the (possibly async) url and open the socket on first iteration. Resolution
    // failures are surfaced through the iterator's `next()`.
    const start = (): void => {
        if (started) {
            return;
        }
        started = true;

        if (abortSignal != null) {
            if (abortSignal.aborted) {
                onAbort();
                return;
            }
            abortSignal.addEventListener("abort", onAbort, { once: true });
        }

        // Resolve the (possibly async) url, connection_init payload, and upgrade headers together. The
        // generator passes the same supplier for connectionParams and headers, so resolve it once.
        const sameHeadersSupplier = args.headers === args.connectionParams;
        Promise.all([
            resolveMaybe<string>(url),
            resolveMaybe<Record<string, unknown>>(args.connectionParams),
            sameHeadersSupplier ? Promise.resolve(undefined) : resolveMaybe<Record<string, unknown>>(args.headers),
        ])
            .then(([resolvedUrl, resolvedConn, resolvedHeadersOnly]) => {
                if (finished) {
                    return;
                }
                if (resolvedUrl == null) {
                    fail(new Error("Failed to resolve GraphQL subscription url."));
                    return;
                }
                resolvedConnectionParams = resolvedConn ?? {};
                const resolvedHeaders = sameHeadersSupplier ? resolvedConn : resolvedHeadersOnly;
                socket =
                    resolvedHeaders != null && Object.keys(resolvedHeaders).length > 0
                        ? new WebSocketCtor(resolvedUrl, GRAPHQL_TRANSPORT_WS_PROTOCOL, { headers: resolvedHeaders })
                        : new WebSocketCtor(resolvedUrl, GRAPHQL_TRANSPORT_WS_PROTOCOL);
                attachHandlers(socket);
            })
            .catch((error: unknown) => {
                fail(error instanceof Error ? error : new Error("Failed to open GraphQL subscription socket."));
            });
    };

    const iterator: AsyncIterableIterator<T> = {
        next(): Promise<IteratorResult<T>> {
            start();
            const queued = pending.shift();
            if (queued != null) {
                return Promise.resolve(queued);
            }
            if (terminalError != null) {
                const error = terminalError;
                terminalError = undefined;
                return Promise.reject(error);
            }
            if (finished) {
                return Promise.resolve({ value: undefined, done: true });
            }
            return new Promise<IteratorResult<T>>((resolve, reject) => {
                waiting.push({ resolve, reject });
            });
        },
        return(value?: T): Promise<IteratorResult<T>> {
            finish();
            return Promise.resolve({ value: value as T, done: true });
        },
        throw(error?: unknown): Promise<IteratorResult<T>> {
            finish();
            return Promise.reject(error);
        },
        [Symbol.asyncIterator](): AsyncIterableIterator<T> {
            return iterator;
        },
    };

    return iterator;
}
