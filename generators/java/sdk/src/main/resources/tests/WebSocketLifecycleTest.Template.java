import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BooleanSupplier;
import java.util.function.Supplier;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public final class WebSocketLifecycleTest {

    /** Minimal in-memory WebSocket that records whether it was closed. */
    private static final class FakeWebSocket implements WebSocket {
        private final AtomicBoolean closed = new AtomicBoolean(false);
        private final Request request;

        FakeWebSocket(Request request) {
            this.request = request;
        }

        @Override
        public Request request() {
            return request;
        }

        @Override
        public long queueSize() {
            return 0;
        }

        @Override
        public boolean send(String text) {
            return !closed.get();
        }

        @Override
        public boolean send(ByteString bytes) {
            return !closed.get();
        }

        @Override
        public boolean close(int code, String reason) {
            return closed.compareAndSet(false, true);
        }

        @Override
        public void cancel() {
            closed.set(true);
        }
    }

    /** Listener that hands the connection supplier's socket straight to onOpen and records failures. */
    private static final class RecordingListener extends ReconnectingWebSocketListener {
        private final List<Throwable> failures = new ArrayList<>();
        private final AtomicInteger opens = new AtomicInteger();

        RecordingListener(
                ReconnectOptions options, Supplier<? extends WebSocket> connectionSupplier, BooleanSupplier closedCheck) {
            super(options, connectionSupplier, closedCheck);
        }

        @Override
        protected void onWebSocketOpen(WebSocket webSocket, Response response) {
            opens.incrementAndGet();
        }

        @Override
        protected void onWebSocketMessage(WebSocket webSocket, String text) {}

        @Override
        protected void onWebSocketBinaryMessage(WebSocket webSocket, ByteString bytes) {}

        @Override
        protected synchronized void onWebSocketFailure(WebSocket webSocket, Throwable t, Response response) {
            failures.add(t);
        }

        @Override
        protected void onWebSocketClosed(WebSocket webSocket, int code, String reason) {}

        synchronized List<Throwable> failures() {
            return new ArrayList<>(failures);
        }
    }

    private static ReconnectingWebSocketListener.ReconnectOptions fastRetries(int maxRetries) {
        return ReconnectingWebSocketListener.ReconnectOptions.builder()
                .minReconnectionDelayMs(1)
                .maxReconnectionDelayMs(5)
                .maxRetries(maxRetries)
                .build();
    }

    private static Request request() {
        return new Request.Builder().url("http://localhost/ws").build();
    }

    @Test
    public void closingClientOptionsDisconnectsOpenWebSocketBeforeShuttingDownHttpClient() {
        ClientOptions clientOptions = ClientOptions.builder().build();
        FakeWebSocket socket = new FakeWebSocket(request());
        AtomicReference<RecordingListener> listenerRef = new AtomicReference<>();
        RecordingListener listener = new RecordingListener(
                fastRetries(3),
                () -> {
                    listenerRef.get().onOpen(socket, null);
                    return socket;
                },
                clientOptions::isClosed);
        listenerRef.set(listener);

        listener.connect();
        Assertions.assertEquals(1, listener.opens.get());
        Assertions.assertSame(socket, listener.getWebSocket());

        AtomicBoolean childClosed = new AtomicBoolean(false);
        clientOptions.registerWebSocket(() -> {
            childClosed.set(true);
            listener.disconnect();
        });

        Assertions.assertFalse(clientOptions.isClosed());
        Assertions.assertDoesNotThrow(clientOptions::close);

        Assertions.assertTrue(clientOptions.isClosed());
        Assertions.assertTrue(childClosed.get(), "root close should close tracked WebSocket clients");
        Assertions.assertTrue(socket.closed.get(), "tracked WebSocket should be disconnected");
        Assertions.assertTrue(
                clientOptions.httpClient().dispatcher().executorService().isShutdown(),
                "SDK-owned OkHttp dispatcher should be shut down after the sockets are closed");
        Assertions.assertTrue(listener.failures().isEmpty(), "clean close should not surface any failure");

        // Closing again is a no-op.
        Assertions.assertDoesNotThrow(clientOptions::close);
    }

    @Test
    public void closingClientOptionsLeavesCallerSuppliedHttpClientRunning() {
        okhttp3.OkHttpClient callerOwned = new okhttp3.OkHttpClient();
        ClientOptions clientOptions = ClientOptions.builder().httpClient(callerOwned).build();
        AtomicBoolean childClosed = new AtomicBoolean(false);
        clientOptions.registerWebSocket(() -> childClosed.set(true));

        clientOptions.close();

        Assertions.assertTrue(childClosed.get());
        Assertions.assertFalse(callerOwned.dispatcher().executorService().isShutdown());
    }

    @Test
    public void reconnectAfterCloseFailsWithClearErrorInsteadOfRetryingAgainstDeadDispatcher() {
        ClientOptions clientOptions = ClientOptions.builder().build();
        AtomicInteger supplierCalls = new AtomicInteger();
        RecordingListener listener = new RecordingListener(
                fastRetries(5),
                () -> {
                    supplierCalls.incrementAndGet();
                    throw new AssertionError("newWebSocket must not be attempted after close");
                },
                clientOptions::isClosed);

        clientOptions.close();
        listener.connect();

        Assertions.assertEquals(0, supplierCalls.get(), "no connection attempt should reach OkHttp");
        List<Throwable> failures = listener.failures();
        Assertions.assertEquals(1, failures.size(), "exactly one failure, no retry loop");
        Assertions.assertTrue(failures.get(0) instanceof IllegalStateException);
        Assertions.assertEquals("root client has been closed", failures.get(0).getMessage());
    }

    @Test
    public void scheduledReconnectStopsOnceClientIsClosed() throws InterruptedException {
        ClientOptions clientOptions = ClientOptions.builder().build();
        CountDownLatch firstAttempt = new CountDownLatch(1);
        AtomicInteger supplierCalls = new AtomicInteger();
        RecordingListener listener = new RecordingListener(
                ReconnectingWebSocketListener.ReconnectOptions.builder()
                        .minReconnectionDelayMs(50)
                        .maxReconnectionDelayMs(50)
                        .maxRetries(10)
                        .build(),
                () -> {
                    supplierCalls.incrementAndGet();
                    firstAttempt.countDown();
                    throw new IllegalStateException("simulated connection failure");
                },
                clientOptions::isClosed);

        // First attempt fails and schedules a reconnect 50ms out; close the client before it fires.
        listener.connect();
        Assertions.assertTrue(firstAttempt.await(5, TimeUnit.SECONDS));
        clientOptions.close();

        // Poll for several multiples of the reconnect delay: a bug would show up as an extra supplier
        // call well within this budget, so most runs don't have to burn the full wait.
        long deadline = System.currentTimeMillis() + 500;
        while (System.currentTimeMillis() < deadline && supplierCalls.get() == 1) {
            Thread.sleep(20);
        }
        Assertions.assertEquals(1, supplierCalls.get(), "no reconnect attempt may run after close");
        for (Throwable failure : listener.failures()) {
            Assertions.assertFalse(
                    String.valueOf(failure.getMessage()).contains("executor rejected"),
                    "closed client must not surface OkHttp executor-rejected errors");
        }
        listener.disconnect();
    }

    @Test
    public void webSocketFactoryRefusesToOpenSocketsAfterClose() {
        ClientOptions clientOptions = ClientOptions.builder().build();
        OkHttpWebSocketFactory factory = new OkHttpWebSocketFactory(clientOptions.httpClient(), clientOptions::isClosed);
        clientOptions.close();

        IllegalStateException error = Assertions.assertThrows(
                IllegalStateException.class, () -> factory.create(request(), new WebSocketListener() {}));
        Assertions.assertEquals("root client has been closed", error.getMessage());
    }

    @Test
    public void registeringWebSocketAfterCloseFailsWithClearError() {
        ClientOptions clientOptions = ClientOptions.builder().build();
        clientOptions.close();

        IllegalStateException error = Assertions.assertThrows(
                IllegalStateException.class, () -> clientOptions.registerWebSocket(() -> {}));
        Assertions.assertEquals("root client has been closed", error.getMessage());
    }
}
