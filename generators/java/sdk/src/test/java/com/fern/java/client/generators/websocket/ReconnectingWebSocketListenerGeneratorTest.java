package com.fern.java.client.generators.websocket;

import static org.assertj.core.api.Assertions.assertThat;

import com.fern.java.output.GeneratedJavaFile;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.function.IntPredicate;
import java.util.function.Supplier;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import okhttp3.Request;
import okhttp3.WebSocket;
import okio.ByteString;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Compiles the generated {@code ReconnectingWebSocketListener} and drives it the way OkHttp would to pin down its
 * close-handshake and reconnect behaviour.
 */
public class ReconnectingWebSocketListenerGeneratorTest {

    private static final String CORE_PACKAGE = "com.example.core";
    private static final int NORMAL_CLOSURE = 1000;
    private static final int GOING_AWAY = 1001;
    private static final int NO_STATUS_RECEIVED = 1005;
    private static final long RECONNECT_WAIT_MS = 500L;
    private static final long RECONNECT_GRACE_MS = 100L;

    /** Implemented by the runtime-compiled test subclass so the test can talk to it without reflection. */
    public interface ListenerHarness {
        void onOpen(WebSocket webSocket, okhttp3.Response response);

        void onClosing(WebSocket webSocket, int code, String reason);

        void onClosed(WebSocket webSocket, int code, String reason);

        void disconnect();

        boolean send(String message, Consumer<WebSocket> onSent);

        boolean sendBinary(ByteString data, Consumer<WebSocket> onSent);

        int closedCallbackCount();
    }

    private static final String HARNESS_SOURCE = "package " + CORE_PACKAGE + ";\n"
            + "import java.util.concurrent.atomic.AtomicInteger;\n"
            + "import java.util.function.IntPredicate;\n"
            + "import java.util.function.Supplier;\n"
            + "public class TestListener extends ReconnectingWebSocketListener implements "
            + ReconnectingWebSocketListenerGeneratorTest.class.getName().replace('$', '.')
            + ".ListenerHarness {\n"
            + "  private final IntPredicate reconnectPolicy;\n"
            + "  private final AtomicInteger closedCallbacks = new AtomicInteger();\n"
            + "  public TestListener(Supplier<? extends okhttp3.WebSocket> supplier, IntPredicate reconnectPolicy) {\n"
            + "    super(ReconnectOptions.builder().minReconnectionDelayMs(10).maxReconnectionDelayMs(10).build(),"
            + " supplier);\n"
            + "    this.reconnectPolicy = reconnectPolicy;\n"
            + "  }\n"
            + "  @Override protected boolean shouldReconnectAfterClose(okhttp3.WebSocket webSocket, int code,"
            + " String reason) {\n"
            + "    return reconnectPolicy == null ? super.shouldReconnectAfterClose(webSocket, code, reason)"
            + " : reconnectPolicy.test(code);\n"
            + "  }\n"
            + "  @Override public int closedCallbackCount() { return closedCallbacks.get(); }\n"
            + "  @Override protected void onWebSocketOpen(okhttp3.WebSocket w, okhttp3.Response r) {}\n"
            + "  @Override protected void onWebSocketMessage(okhttp3.WebSocket w, String t) {}\n"
            + "  @Override protected void onWebSocketBinaryMessage(okhttp3.WebSocket w, okio.ByteString b) {}\n"
            + "  @Override protected void onWebSocketFailure(okhttp3.WebSocket w, Throwable t, okhttp3.Response r) {}\n"
            + "  @Override protected void onWebSocketClosed(okhttp3.WebSocket w, int code, String reason) {\n"
            + "    closedCallbacks.incrementAndGet();\n"
            + "  }\n"
            + "}\n";

    private static String generatedSource;
    private static Class<?> harnessClass;

    @BeforeAll
    static void compileGeneratedListener() throws Exception {
        GeneratedJavaFile generated = new ReconnectingWebSocketListenerGenerator(CORE_PACKAGE).generateListener();
        generatedSource = generated.javaFile().toString();
        ClassLoader loader = compile(Map.of(
                CORE_PACKAGE + ".ReconnectingWebSocketListener", generatedSource,
                CORE_PACKAGE + ".TestListener", HARNESS_SOURCE));
        harnessClass = loader.loadClass(CORE_PACKAGE + ".TestListener");
    }

    @Test
    void onClosing_acknowledgesPeerCloseWithSameCode() throws Exception {
        FakeWebSocket socket = new FakeWebSocket(true);
        ListenerHarness listener = newListener(new CountingSupplier(), null);
        try {
            listener.onClosing(socket, GOING_AWAY, "server restarting");
            assertThat(socket.closeCode).isEqualTo(GOING_AWAY);
            assertThat(socket.closeReason).isEqualTo("server restarting");
        } finally {
            listener.disconnect();
        }
    }

    @Test
    void onClosing_neverEchoesNoStatusSentinel() throws Exception {
        FakeWebSocket socket = new FakeWebSocket(true);
        ListenerHarness listener = newListener(new CountingSupplier(), null);
        try {
            listener.onClosing(socket, NO_STATUS_RECEIVED, "");
            assertThat(socket.closeCode)
                    .as("1005 is a local sentinel and must not be sent on the wire")
                    .isNotEqualTo(NO_STATUS_RECEIVED)
                    .isEqualTo(NORMAL_CLOSURE);
        } finally {
            listener.disconnect();
        }
    }

    @Test
    void serverInitiatedClose_deliversClosedCallbackWithoutClientDisconnect() throws Exception {
        FakeWebSocket socket = new FakeWebSocket(true);
        CountingSupplier supplier = new CountingSupplier();
        ListenerHarness listener = newListener(supplier, null);
        try {
            listener.onOpen(socket, null);
            // OkHttp: peer close frame -> onClosing; after our acknowledgement -> onClosed.
            listener.onClosing(socket, NORMAL_CLOSURE, "stream complete");
            assertThat(socket.closeCode).isEqualTo(NORMAL_CLOSURE);
            listener.onClosed(socket, NORMAL_CLOSURE, "stream complete");

            assertThat(listener.closedCallbackCount()).isEqualTo(1);
            assertThat(awaitReconnects(supplier, 0)).isZero();
        } finally {
            listener.disconnect();
        }
    }

    @Test
    void defaultPolicy_reconnectsOnAnyCodeExceptNormalClosure() throws Exception {
        for (int code : Arrays.asList(GOING_AWAY, NO_STATUS_RECEIVED, 1006, 1011)) {
            CountingSupplier supplier = new CountingSupplier();
            ListenerHarness listener = newListener(supplier, null);
            try {
                listener.onClosed(new FakeWebSocket(true), code, "");
                assertThat(awaitReconnects(supplier, 1))
                        .as("close code %d should reconnect by default", code)
                        .isEqualTo(1);
            } finally {
                listener.disconnect();
            }
        }

        CountingSupplier supplier = new CountingSupplier();
        ListenerHarness listener = newListener(supplier, null);
        try {
            listener.onClosed(new FakeWebSocket(true), NORMAL_CLOSURE, "");
            assertThat(awaitReconnects(supplier, 0)).isZero();
        } finally {
            listener.disconnect();
        }
    }

    @Test
    void subclassOverride_canSuppressReconnectForTerminalClose() throws Exception {
        CountingSupplier supplier = new CountingSupplier();
        ListenerHarness listener = newListener(supplier, code -> false);
        try {
            listener.onClosed(new FakeWebSocket(true), NO_STATUS_RECEIVED, "");
            assertThat(listener.closedCallbackCount()).isEqualTo(1);
            assertThat(awaitReconnects(supplier, 0)).isZero();
        } finally {
            listener.disconnect();
        }
    }

    @Test
    void subclassOverride_onlyAffectsMatchingCloses() throws Exception {
        // Mirrors a resource client that treats a no-status close as terminal only after the socket
        // accepted its stream-ending message.
        AtomicReference<WebSocket> expectedCloseSocket = new AtomicReference<>();
        IntPredicate policy = code -> code != NO_STATUS_RECEIVED || expectedCloseSocket.get() == null;

        CountingSupplier unrelatedSupplier = new CountingSupplier();
        ListenerHarness unrelated = newListener(unrelatedSupplier, policy);
        try {
            unrelated.onOpen(new FakeWebSocket(true), null);
            unrelated.onClosed(new FakeWebSocket(true), NO_STATUS_RECEIVED, "");
            assertThat(awaitReconnects(unrelatedSupplier, 1))
                    .as("a no-status close without the stream-ending message keeps reconnecting")
                    .isEqualTo(1);
        } finally {
            unrelated.disconnect();
        }

        FakeWebSocket terminalSocket = new FakeWebSocket(true);
        CountingSupplier terminalSupplier = new CountingSupplier();
        ListenerHarness terminal = newListener(terminalSupplier, policy);
        try {
            terminal.onOpen(terminalSocket, null);
            assertThat(terminal.send("{\"type\":\"CloseStream\"}", expectedCloseSocket::set))
                    .isTrue();
            assertThat(expectedCloseSocket.get()).isSameAs(terminalSocket);
            terminal.onClosed(terminalSocket, NO_STATUS_RECEIVED, "");
            assertThat(terminal.closedCallbackCount()).isEqualTo(1);
            assertThat(awaitReconnects(terminalSupplier, 0)).isZero();
        } finally {
            terminal.disconnect();
        }
    }

    @Test
    void sendWithCallback_onlyReportsSocketWhenSentDirectly() throws Exception {
        List<WebSocket> accepted = new ArrayList<>();
        ListenerHarness listener = newListener(new CountingSupplier(), null);
        try {
            assertThat(listener.send("queued", accepted::add)).isFalse();
            assertThat(accepted).isEmpty();

            FakeWebSocket rejecting = new FakeWebSocket(false);
            listener.onOpen(rejecting, null);
            assertThat(listener.send("dropped-by-socket", accepted::add)).isFalse();
            assertThat(listener.sendBinary(ByteString.encodeUtf8("bin"), accepted::add))
                    .isFalse();
            assertThat(accepted).isEmpty();

            FakeWebSocket accepting = new FakeWebSocket(true);
            listener.onOpen(accepting, null);
            assertThat(listener.send("sent", accepted::add)).isTrue();
            assertThat(listener.sendBinary(ByteString.encodeUtf8("bin"), accepted::add))
                    .isTrue();
            assertThat(accepted).containsExactly(accepting, accepting);
        } finally {
            listener.disconnect();
        }
    }

    @Test
    void generatedSource_keepsDefaultReconnectDecision() {
        String normalized = generatedSource.replaceAll("\\s+", " ");
        assertThat(normalized)
                .contains("if (shouldReconnect.get() && shouldReconnectAfterClose(webSocket, code, reason))")
                .contains("protected boolean shouldReconnectAfterClose(WebSocket webSocket, int code, String reason) { "
                        + "return code != 1000; }")
                .contains("webSocket.close(code == 1005 ? 1000 : code, reason)");
    }

    @Test
    void generatedSource_connectFailureMessagesCloseTheirParentheses() {
        String normalized = generatedSource.replaceAll("\\s+", " ");
        assertThat(normalized)
                .contains("\"WebSocket connection timeout after \" + 4000 + \" milliseconds\" "
                        + "+ (retryCount.get() > 0 ? \" (retry attempt #\" + retryCount.get() + \")\" "
                        + ": \" (initial connection attempt)\")")
                .contains("\"WebSocket connection interrupted\" "
                        + "+ (retryCount.get() > 0 ? \" during retry attempt #\" + retryCount.get() "
                        + ": \" during initial connection\")")
                .contains("retryCount.get() > 0 ? \"WebSocket connection failed during retry attempt #\" "
                        + "+ retryCount.get() : \"WebSocket connection failed during initial attempt\"");
    }

    private static ListenerHarness newListener(Supplier<WebSocket> supplier, IntPredicate reconnectPolicy)
            throws Exception {
        return (ListenerHarness)
                harnessClass.getConstructor(Supplier.class, IntPredicate.class).newInstance(supplier, reconnectPolicy);
    }

    /**
     * Waits for the reconnect executor to (not) fire and returns the number of connection attempts observed. Once
     * {@code expected} attempts are seen, keeps watching for a grace period so extra attempts are caught.
     */
    private static int awaitReconnects(CountingSupplier supplier, int expected) throws InterruptedException {
        long deadline = System.currentTimeMillis() + RECONNECT_WAIT_MS;
        while (System.currentTimeMillis() < deadline && supplier.calls.get() < expected) {
            Thread.sleep(20);
        }
        if (expected > 0) {
            Thread.sleep(RECONNECT_GRACE_MS);
        }
        return supplier.calls.get();
    }

    private static final class CountingSupplier implements Supplier<WebSocket> {
        final AtomicInteger calls = new AtomicInteger();

        @Override
        public WebSocket get() {
            calls.incrementAndGet();
            return new FakeWebSocket(true);
        }
    }

    private static final class FakeWebSocket implements WebSocket {
        private final boolean acceptsSends;
        int closeCode = -1;
        String closeReason;

        FakeWebSocket(boolean acceptsSends) {
            this.acceptsSends = acceptsSends;
        }

        @Override
        public Request request() {
            return new Request.Builder().url("ws://localhost/").build();
        }

        @Override
        public long queueSize() {
            return 0;
        }

        @Override
        public boolean send(String text) {
            return acceptsSends;
        }

        @Override
        public boolean send(ByteString bytes) {
            return acceptsSends;
        }

        @Override
        public boolean close(int code, String reason) {
            closeCode = code;
            closeReason = reason;
            return true;
        }

        @Override
        public void cancel() {}
    }

    private static ClassLoader compile(Map<String, String> sources) throws Exception {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        StandardJavaFileManager standard = compiler.getStandardFileManager(null, null, null);
        Map<String, ByteArrayOutputStream> classBytes = new HashMap<>();
        ForwardingJavaFileManager<StandardJavaFileManager> inMemory = new ForwardingJavaFileManager<>(standard) {
            @Override
            public JavaFileObject getJavaFileForOutput(
                    Location location, String className, JavaFileObject.Kind kind, FileObject sibling) {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                classBytes.put(className, out);
                return new SimpleJavaFileObject(URI.create("mem:///" + className + kind.extension), kind) {
                    @Override
                    public OutputStream openOutputStream() {
                        return out;
                    }
                };
            }
        };
        List<JavaFileObject> units = new ArrayList<>();
        sources.forEach((name, source) -> units.add(
                new SimpleJavaFileObject(
                        URI.create("mem:///" + name.replace('.', '/') + ".java"), JavaFileObject.Kind.SOURCE) {
                    @Override
                    public CharSequence getCharContent(boolean ignoreEncodingErrors) {
                        return source;
                    }
                }));
        List<String> options = Arrays.asList("-classpath", System.getProperty("java.class.path"), "-proc:none");
        ByteArrayOutputStream diagnostics = new ByteArrayOutputStream();
        boolean ok = compiler.getTask(new java.io.PrintWriter(diagnostics, true), inMemory, null, options, null, units)
                .call();
        assertThat(ok).as("generated listener must compile:\n%s", diagnostics).isTrue();
        return new ClassLoader(ReconnectingWebSocketListenerGeneratorTest.class.getClassLoader()) {
            @Override
            protected Class<?> findClass(String name) throws ClassNotFoundException {
                ByteArrayOutputStream bytes = classBytes.get(name);
                if (bytes == null) {
                    throw new ClassNotFoundException(name);
                }
                byte[] b = bytes.toByteArray();
                return defineClass(name, b, 0, b.length);
            }
        };
    }
}
