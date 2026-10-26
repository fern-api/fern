import { CloseEvent, ErrorEvent } from "../../../src/core/websocket/events";
import { ReconnectingWebSocket } from "../../../src/core/websocket/ws";

type Listener = (event: unknown) => void;

class FakeWebSocket {
    public static readonly CONNECTING = 0;
    public static readonly OPEN = 1;
    public static readonly CLOSING = 2;
    public static readonly CLOSED = 3;

    public static instances: FakeWebSocket[] = [];

    public readyState = FakeWebSocket.CONNECTING;
    public binaryType: BinaryType = "blob";
    public bufferedAmount = 0;
    public extensions = "";
    public protocol = "";
    public readonly url: string;
    public closeCalls: { code?: number; reason?: string }[] = [];
    private listeners: Record<string, Listener[]> = {};

    constructor(url: string) {
        this.url = url;
        FakeWebSocket.instances.push(this);
    }

    public addEventListener(type: string, listener: Listener): void {
        (this.listeners[type] ??= []).push(listener);
    }

    public removeEventListener(type: string, listener: Listener): void {
        this.listeners[type] = (this.listeners[type] ?? []).filter((l) => l !== listener);
    }

    public send(): void {}

    public close(code?: number, reason?: string): void {
        this.closeCalls.push({ code, reason });
        this.readyState = FakeWebSocket.CLOSED;
    }

    public simulateOpen(): void {
        this.readyState = FakeWebSocket.OPEN;
        this.dispatch("open", { type: "open" });
    }

    public simulateServerClose(code: number, reason = ""): void {
        this.readyState = FakeWebSocket.CLOSED;
        this.dispatch("close", new CloseEvent(code, reason, this));
    }

    public simulateError(): void {
        this.dispatch("error", new ErrorEvent(new Error("ECONNREFUSED"), this));
    }

    private dispatch(type: string, event: unknown): void {
        for (const listener of [...(this.listeners[type] ?? [])]) {
            listener(event);
        }
    }
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 20));

const createSocket = (options: ReconnectingWebSocket.Options = {}, abortSignal?: AbortSignal): ReconnectingWebSocket =>
    new ReconnectingWebSocket({
        url: "ws://localhost/test",
        abortSignal,
        options: {
            WebSocket: FakeWebSocket,
            minReconnectionDelay: 0,
            maxReconnectionDelay: 0,
            ...options,
        },
    });

describe("ReconnectingWebSocket reconnect policy", () => {
    let socket: ReconnectingWebSocket | undefined;

    beforeEach(() => {
        FakeWebSocket.instances = [];
    });

    afterEach(() => {
        socket?.close();
        socket = undefined;
        vi.useRealTimers();
    });

    const openInitialConnection = async (options?: ReconnectingWebSocket.Options): Promise<FakeWebSocket> => {
        socket = createSocket(options);
        await flush();
        expect(FakeWebSocket.instances).toHaveLength(1);
        const ws = FakeWebSocket.instances[0] as FakeWebSocket;
        ws.simulateOpen();
        return ws;
    };

    it("does not reconnect after a normal closure (1000) by default", async () => {
        const ws = await openInitialConnection();
        const onClose = vi.fn();
        socket?.addEventListener("close", onClose);

        ws.simulateServerClose(1000);
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("reconnects after a connection error without consulting the server close policy", async () => {
        const shouldReconnect = vi.fn(() => false);
        socket = createSocket({ shouldReconnect });
        await flush();
        const ws = FakeWebSocket.instances[0] as FakeWebSocket;
        const onClose = vi.fn();
        const onError = vi.fn();
        socket.addEventListener("close", onClose);
        socket.addEventListener("error", onError);

        ws.simulateError();
        await flush();

        expect(shouldReconnect).not.toHaveBeenCalled();
        expect(FakeWebSocket.instances).toHaveLength(2);
        expect(socket.retryCount).toBe(1);
        expect(ws.closeCalls).toEqual([{ code: 1000, reason: undefined }]);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose.mock.calls[0]?.[0]).toMatchObject({ code: 1000 });
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it("retries connection timeouts only up to maxRetries", async () => {
        vi.useFakeTimers();
        const shouldReconnect = vi.fn(() => false);
        const onError = vi.fn();
        socket = createSocket({ connectionTimeout: 100, maxRetries: 2, shouldReconnect });
        socket.addEventListener("error", onError);
        await vi.advanceTimersByTimeAsync(1);
        expect(FakeWebSocket.instances).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(400);

        expect(FakeWebSocket.instances).toHaveLength(3);
        expect(socket.retryCount).toBe(2);
        expect(onError).toHaveBeenCalledTimes(3);
        expect(onError.mock.calls[0]?.[0]).toMatchObject({ message: "TIMEOUT" });
        expect(shouldReconnect).not.toHaveBeenCalled();
        expect(FakeWebSocket.instances.every((ws) => ws.closeCalls[0]?.reason === "timeout")).toBe(true);
    });

    it("does not retry an error after explicit close", async () => {
        const shouldReconnect = vi.fn(() => true);
        const ws = await openInitialConnection({ shouldReconnect });

        socket?.close();
        ws.simulateError();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
        expect(shouldReconnect).not.toHaveBeenCalled();
    });

    it.each(["close", "error"] as const)("honors close() inside an %s listener during an error", async (event) => {
        const ws = await openInitialConnection();
        socket?.addEventListener(event, () => socket?.close());

        ws.simulateError();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it.each(["onclose", "onerror"] as const)("honors close() inside %s during an error", async (handler) => {
        const ws = await openInitialConnection();
        if (socket) {
            socket[handler] = () => socket?.close();
        }

        ws.simulateError();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it("honors abort during an internal close notification", async () => {
        const controller = new AbortController();
        const shouldReconnect = vi.fn(() => true);
        socket = createSocket({ shouldReconnect }, controller.signal);
        await flush();
        const ws = FakeWebSocket.instances[0] as FakeWebSocket;
        socket.addEventListener("close", () => controller.abort());

        ws.simulateError();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
        expect(shouldReconnect).not.toHaveBeenCalled();
    });

    it("does not retry a connection error when maxRetries is 0", async () => {
        const ws = await openInitialConnection({ maxRetries: 0 });

        ws.simulateError();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it("manually reconnects an active socket without consulting the server close policy", async () => {
        const shouldReconnect = vi.fn(() => false);
        const ws = await openInitialConnection({ shouldReconnect });
        const onClose = vi.fn();
        socket?.addEventListener("close", onClose);

        socket?.reconnect();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(2);
        expect(shouldReconnect).not.toHaveBeenCalled();
        expect(ws.closeCalls).toHaveLength(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("honors close() during a manual reconnect notification", async () => {
        await openInitialConnection();
        socket?.addEventListener("close", () => socket?.close());

        socket?.reconnect();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it("allows manual reconnect after error retries are exhausted", async () => {
        const ws = await openInitialConnection({ maxRetries: 1 });
        ws.simulateError();
        await flush();
        expect(FakeWebSocket.instances).toHaveLength(2);

        const retried = FakeWebSocket.instances[1] as FakeWebSocket;
        retried.simulateError();
        await flush();
        expect(FakeWebSocket.instances).toHaveLength(2);

        socket?.reconnect();
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(3);
        expect(socket?.retryCount).toBe(0);
    });

    it("reconnects after a non-1000 close (1005) by default", async () => {
        const ws = await openInitialConnection();

        ws.simulateServerClose(1005);
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(2);
        expect(socket?.retryCount).toBe(1);
    });

    it("reconnects after an abnormal close (1006) by default", async () => {
        const ws = await openInitialConnection();

        ws.simulateServerClose(1006);
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    it("does not reconnect when shouldReconnect returns false", async () => {
        const shouldReconnect = vi.fn((_event: CloseEvent) => false);
        const ws = await openInitialConnection({ shouldReconnect });
        const onClose = vi.fn();
        socket?.addEventListener("close", onClose);

        ws.simulateServerClose(1005, "stream finished");
        await flush();

        expect(shouldReconnect).toHaveBeenCalledTimes(1);
        expect(shouldReconnect.mock.calls[0]?.[0]).toMatchObject({ code: 1005, reason: "stream finished" });
        expect(FakeWebSocket.instances).toHaveLength(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("reconnects on 1000 when shouldReconnect returns true", async () => {
        const ws = await openInitialConnection({ shouldReconnect: () => true });

        ws.simulateServerClose(1000);
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    it("supports a stateful predicate that becomes terminal after a client-side end-of-stream", async () => {
        let streamEnded = false;
        const ws = await openInitialConnection({
            shouldReconnect: (event) => !streamEnded && event.code !== 1000,
        });

        ws.simulateServerClose(1005);
        await flush();
        expect(FakeWebSocket.instances).toHaveLength(2);

        const reconnected = FakeWebSocket.instances[1] as FakeWebSocket;
        reconnected.simulateOpen();
        streamEnded = true;
        reconnected.simulateServerClose(1005);
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(2);
    });

    it("treats a throwing shouldReconnect as terminal", async () => {
        const ws = await openInitialConnection({
            shouldReconnect: () => {
                throw new Error("boom");
            },
        });

        ws.simulateServerClose(1005);
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it("never reconnects after close() regardless of shouldReconnect", async () => {
        const shouldReconnect = vi.fn(() => true);
        const ws = await openInitialConnection({ shouldReconnect });

        socket?.close();
        ws.simulateServerClose(1000);
        await flush();

        expect(shouldReconnect).not.toHaveBeenCalled();
        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it("does not reconnect when maxRetries is 0", async () => {
        const ws = await openInitialConnection({ maxRetries: 0 });

        ws.simulateServerClose(1005);
        await flush();

        expect(FakeWebSocket.instances).toHaveLength(1);
    });
});

describe("ReconnectingWebSocket waitForOpen", () => {
    let socket: ReconnectingWebSocket | undefined;

    beforeEach(() => {
        FakeWebSocket.instances = [];
    });

    afterEach(() => {
        socket?.close();
        socket = undefined;
    });

    const settleState = async (promise: Promise<unknown>): Promise<"resolved" | "rejected" | "pending"> => {
        let state: "resolved" | "rejected" | "pending" = "pending";
        promise.then(
            () => {
                state = "resolved";
            },
            () => {
                state = "rejected";
            },
        );
        await flush();
        return state;
    };

    const latestFakeSocket = (): FakeWebSocket =>
        FakeWebSocket.instances[FakeWebSocket.instances.length - 1] as FakeWebSocket;

    it("resolves when the connection opens", async () => {
        socket = createSocket();
        const waiting = socket.waitForOpen();
        await flush();
        latestFakeSocket().simulateOpen();

        expect(await settleState(waiting)).toBe("resolved");
    });

    it("resolves immediately when the connection is already open", async () => {
        socket = createSocket();
        await flush();
        latestFakeSocket().simulateOpen();

        expect(await settleState(socket.waitForOpen())).toBe("resolved");
    });

    it("rejects with the error event when the connection errors", async () => {
        socket = createSocket({ maxRetries: 0 });
        const waiting = socket.waitForOpen();
        await flush();
        latestFakeSocket().simulateError();

        await expect(waiting).rejects.toBeInstanceOf(ErrorEvent);
    });

    it("rejects when called after close()", async () => {
        socket = createSocket();
        await flush();
        latestFakeSocket().simulateOpen();
        socket.close();

        expect(socket.readyState).toBe(ReconnectingWebSocket.CLOSED);
        await expect(socket.waitForOpen()).rejects.toThrow("WebSocket closed before the connection was opened");
    });

    it("rejects when close() is called while connecting", async () => {
        socket = createSocket();
        await flush();
        const waiting = socket.waitForOpen();
        socket.close();

        expect(await settleState(waiting)).toBe("rejected");
    });

    it("rejects when the abort signal fires during the handshake", async () => {
        const controller = new AbortController();
        socket = createSocket({}, controller.signal);
        await flush();
        expect(FakeWebSocket.instances).toHaveLength(1);
        const waiting = socket.waitForOpen();
        controller.abort();

        expect(await settleState(waiting)).toBe("rejected");
        expect(socket.readyState).toBe(ReconnectingWebSocket.CLOSED);
    });

    it("rejects and emits close when aborted before the underlying WebSocket exists", async () => {
        const controller = new AbortController();
        socket = createSocket({}, controller.signal);
        const onClose = vi.fn();
        socket.addEventListener("close", onClose);
        const waiting = socket.waitForOpen();
        controller.abort();

        expect(await settleState(waiting)).toBe("rejected");
        expect(socket.readyState).toBe(ReconnectingWebSocket.CLOSED);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(FakeWebSocket.instances).toHaveLength(0);
        await expect(socket.waitForOpen()).rejects.toThrow("WebSocket closed before the connection was opened");
    });

    it("rejects when the abort signal is already aborted", async () => {
        socket = createSocket({}, AbortSignal.abort());

        expect(socket.readyState).toBe(ReconnectingWebSocket.CLOSED);
        expect(await settleState(socket.waitForOpen())).toBe("rejected");
        expect(FakeWebSocket.instances).toHaveLength(0);
    });

    it("rejects when the server closes without a reconnect", async () => {
        socket = createSocket();
        await flush();
        const waiting = socket.waitForOpen();
        latestFakeSocket().simulateServerClose(1000);

        expect(await settleState(waiting)).toBe("rejected");
    });

    it("keeps waiting while a reconnect is pending and resolves once reconnected", async () => {
        socket = createSocket();
        await flush();
        const waiting = socket.waitForOpen();
        latestFakeSocket().simulateServerClose(1006);

        expect(await settleState(waiting)).toBe("pending");
        expect(FakeWebSocket.instances).toHaveLength(2);
        latestFakeSocket().simulateOpen();
        expect(await settleState(waiting)).toBe("resolved");
    });

    it("rejects with an error event when the URL provider fails", async () => {
        socket = new ReconnectingWebSocket({
            url: () => Promise.reject(new Error("url lookup failed")),
            options: { WebSocket: FakeWebSocket, maxRetries: 0 },
        });
        const onError = vi.fn();
        socket.addEventListener("error", onError);

        await expect(socket.waitForOpen()).rejects.toBeInstanceOf(ErrorEvent);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(FakeWebSocket.instances).toHaveLength(0);
        await expect(socket.waitForOpen()).rejects.toThrow("WebSocket closed before the connection was opened");
    });

    it("rejects when close() is called while a reconnect is pending", async () => {
        socket = createSocket({ minReconnectionDelay: 1000, maxReconnectionDelay: 1000 });
        await flush();
        latestFakeSocket().simulateOpen();
        latestFakeSocket().simulateServerClose(1006);
        const waiting = socket.waitForOpen();
        expect(await settleState(waiting)).toBe("pending");
        socket.close();

        expect(await settleState(waiting)).toBe("rejected");
    });
});
