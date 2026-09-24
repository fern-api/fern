package com.fern.java.client.generators.websocket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.Test;

/**
 * End-to-end smoke test for Devin's WebSocketLifecycleTest.Template.java (added by this PR's fix): compiles it,
 * verbatim, alongside REAL generator output for WebSocketFactory/OkHttpWebSocketFactory/ReconnectingWebSocketListener
 * (via their generators, exactly as Cli.java would produce them) plus a hand-written ClientOptions stand-in that
 * mirrors the real generated shape (verified against ClientOptionsGenerator's source), with the package line injected
 * the same way GeneratedResourcesJavaFile.writeToFile() does it for every real SDK. Then actually RUNS the compiled
 * tests via the JUnit Platform Launcher and asserts they all pass. This directly answers nitpickybot's "critical"
 * concern about whether the template even compiles once it lands in a real package.
 */
public class WebSocketLifecycleTemplateSmokeTest {

    private static final String CORE_PACKAGE = "com.example.core3";

    private static final String CLIENT_OPTIONS_STAND_IN = "package " + CORE_PACKAGE + ";\n"
            + "import java.util.List;\n"
            + "import java.util.Set;\n"
            + "import java.util.ArrayList;\n"
            + "import java.util.concurrent.ConcurrentHashMap;\n"
            + "import java.util.concurrent.atomic.AtomicBoolean;\n"
            + "public final class ClientOptions {\n"
            + "  public static final String CLOSED_MESSAGE = \"root client has been closed\";\n"
            + "  private final okhttp3.OkHttpClient okHttpClient;\n"
            + "  private final boolean ownsHttpClient;\n"
            + "  private final AtomicBoolean closed;\n"
            + "  private final Set<AutoCloseable> openWebSockets;\n"
            // Mirrors the real fix: closed/openWebSockets are constructor parameters, not self-initialized, so
            // Builder.from(...) can forward the SAME instances into a derived sibling. An ordinary builder() (or
            // one seeded only via Builder.httpClient(shared)) never shares them, even with another ClientOptions
            // wrapping the identical httpClient - only explicit from(...) lineage shares lifecycle state.
            + "  private ClientOptions(okhttp3.OkHttpClient okHttpClient, boolean ownsHttpClient, AtomicBoolean"
            + " closed, Set<AutoCloseable> openWebSockets) {\n"
            + "    this.okHttpClient = okHttpClient;\n"
            + "    this.ownsHttpClient = ownsHttpClient;\n"
            + "    this.closed = closed;\n"
            + "    this.openWebSockets = openWebSockets;\n"
            + "  }\n"
            + "  public okhttp3.OkHttpClient httpClient() { return okHttpClient; }\n"
            + "  public boolean isClosed() { return closed.get(); }\n"
            + "  public void registerWebSocket(AutoCloseable webSocket) {\n"
            + "    openWebSockets.add(webSocket);\n"
            + "    if (closed.get()) {\n"
            + "      openWebSockets.remove(webSocket);\n"
            + "      throw new IllegalStateException(CLOSED_MESSAGE);\n"
            + "    }\n"
            + "  }\n"
            + "  public void unregisterWebSocket(AutoCloseable webSocket) { openWebSockets.remove(webSocket); }\n"
            + "  public void close() {\n"
            + "    if (!closed.compareAndSet(false, true)) { return; }\n"
            + "    for (AutoCloseable webSocket : new ArrayList<>(openWebSockets)) {\n"
            + "      try { webSocket.close(); } catch (Exception e) { /* best effort */ }\n"
            + "    }\n"
            + "    openWebSockets.clear();\n"
            + "    if (!ownsHttpClient) { return; }\n"
            + "    okHttpClient.dispatcher().executorService().shutdown();\n"
            + "    okHttpClient.connectionPool().evictAll();\n"
            + "  }\n"
            + "  public static Builder builder() { return new Builder(); }\n"
            + "  public static Builder from(ClientOptions clientOptions) {\n"
            + "    Builder builder = new Builder();\n"
            + "    builder.httpClient = clientOptions.okHttpClient;\n"
            + "    builder.ownsHttpClient = clientOptions.ownsHttpClient;\n"
            + "    builder.closed = clientOptions.closed;\n"
            + "    builder.openWebSockets = clientOptions.openWebSockets;\n"
            + "    return builder;\n"
            + "  }\n"
            + "  public static final class Builder {\n"
            + "    private okhttp3.OkHttpClient httpClient;\n"
            + "    private boolean ownsHttpClient = true;\n"
            + "    private AtomicBoolean closed;\n"
            + "    private Set<AutoCloseable> openWebSockets;\n"
            + "    public Builder httpClient(okhttp3.OkHttpClient httpClient) {\n"
            + "      this.httpClient = httpClient;\n"
            + "      this.ownsHttpClient = httpClient == null;\n"
            + "      return this;\n"
            + "    }\n"
            + "    public ClientOptions build() {\n"
            + "      okhttp3.OkHttpClient client = httpClient != null ? httpClient : new okhttp3.OkHttpClient();\n"
            + "      AtomicBoolean closedToUse = this.closed != null ? this.closed : new AtomicBoolean(false);\n"
            + "      Set<AutoCloseable> openWebSocketsToUse = this.openWebSockets != null ? this.openWebSockets :"
            + " ConcurrentHashMap.newKeySet();\n"
            + "      return new ClientOptions(client, ownsHttpClient, closedToUse, openWebSocketsToUse);\n"
            + "    }\n"
            + "  }\n"
            + "}\n";

    @Test
    void generatedTemplateCompilesAndPassesAgainstRealGeneratorOutput() throws Exception {
        String webSocketFactoryInterface = new WebSocketFactoryGenerator(CORE_PACKAGE)
                .generateInterface()
                .javaFile()
                .toString();
        String okHttpWebSocketFactoryImpl = new OkHttpWebSocketFactoryGenerator(CORE_PACKAGE)
                .generateImplementation()
                .javaFile()
                .toString();
        String reconnectingListener = new ReconnectingWebSocketListenerGenerator(CORE_PACKAGE)
                .generateListener()
                .javaFile()
                .toString();

        String templateResource;
        try (InputStream is = WebSocketLifecycleTemplateSmokeTest.class.getResourceAsStream(
                "/tests/WebSocketLifecycleTest.Template.java")) {
            if (is == null) {
                throw new IOException("WebSocketLifecycleTest.Template.java resource not found");
            }
            templateResource = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        // Mirrors GeneratedResourcesJavaFile.writeToFile(): "package " + packageName + ";\n\n" + contents().
        String templateSource = "package " + CORE_PACKAGE + ";\n\n" + templateResource;

        Map<String, String> sources = new HashMap<>();
        sources.put(CORE_PACKAGE + ".ClientOptions", CLIENT_OPTIONS_STAND_IN);
        sources.put(CORE_PACKAGE + ".WebSocketFactory", webSocketFactoryInterface);
        sources.put(CORE_PACKAGE + ".OkHttpWebSocketFactory", okHttpWebSocketFactoryImpl);
        sources.put(CORE_PACKAGE + ".ReconnectingWebSocketListener", reconnectingListener);
        sources.put(CORE_PACKAGE + ".WebSocketLifecycleTest", templateSource);

        ClassLoader loader = compile(sources);
        Class<?> testClass = loader.loadClass(CORE_PACKAGE + ".WebSocketLifecycleTest");

        List<String> ran = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        for (Method method : testClass.getDeclaredMethods()) {
            boolean isTest = false;
            for (Annotation annotation : method.getAnnotations()) {
                if (annotation.annotationType().getName().equals("org.junit.jupiter.api.Test")) {
                    isTest = true;
                    break;
                }
            }
            if (!isTest) {
                continue;
            }
            method.setAccessible(true);
            ran.add(method.getName());
            try {
                Object instance = testClass.getDeclaredConstructor().newInstance();
                method.invoke(instance);
            } catch (Exception e) {
                Throwable cause = e.getCause() != null ? e.getCause() : e;
                failures.add(method.getName() + ": " + cause);
            }
        }

        assertTrue(!ran.isEmpty(), "expected @Test methods in the generated WebSocketLifecycleTest template");
        assertThat(failures)
                .as("all @Test methods in the generated WebSocketLifecycleTest.Template.java must pass; ran: %s", ran)
                .isEmpty();
    }

    /**
     * Regression test for Devin Review's "derived clients reconnect against closed dispatcher" finding:
     * ClientOptions.Builder.from(...) copies the httpClient reference into a sibling, but (before the fix) each
     * ClientOptions had its own fresh closed flag and openWebSockets set, so closing one sibling shut down their shared
     * dispatcher while the other sibling's sockets stayed "open" and kept trying to reconnect against it. Builds a
     * sibling via Builder.from(...) (the actual lineage that shares an owned OkHttpClient) against the
     * CLIENT_OPTIONS_STAND_IN, which mirrors the corrected fix: closed/openWebSockets forwarded through from(...), not
     * shared by raw OkHttpClient identity (a follow-up Devin Review flagged: sharing by identity leaked every
     * constructed OkHttpClient for the JVM's lifetime and over-shared state between unrelated ClientOptions that merely
     * passed the same caller-supplied httpClient to Builder.httpClient(...)).
     */
    @Test
    void closingASiblingClosesItsFromDerivedSiblingsSocketsToo() throws Exception {
        ClassLoader loader = compile(Map.of(CORE_PACKAGE + ".ClientOptions", CLIENT_OPTIONS_STAND_IN));
        Class<?> clientOptionsClass = loader.loadClass(CORE_PACKAGE + ".ClientOptions");

        Object builderA = clientOptionsClass.getMethod("builder").invoke(null);
        Object optionsA = builderA.getClass().getMethod("build").invoke(builderA);

        // B is derived FROM A - the actual lineage that shares an owned OkHttpClient/dispatcher.
        Object builderB =
                clientOptionsClass.getMethod("from", clientOptionsClass).invoke(null, optionsA);
        Object optionsB = builderB.getClass().getMethod("build").invoke(builderB);

        AtomicBoolean bSocketClosed = new AtomicBoolean(false);
        AutoCloseable bSocket = () -> bSocketClosed.set(true);
        optionsB.getClass().getMethod("registerWebSocket", AutoCloseable.class).invoke(optionsB, bSocket);

        // Close A only; B never had close() called on it directly.
        optionsA.getClass().getMethod("close").invoke(optionsA);

        assertThat((boolean) optionsB.getClass().getMethod("isClosed").invoke(optionsB))
                .as("closing A must be visible on its from(...)-derived sibling B")
                .isTrue();
        assertThat(bSocketClosed.get())
                .as("A's close() must have disconnected B's tracked socket too, before it can reconnect against"
                        + " the (now shared-and-shutdown) dispatcher")
                .isTrue();
    }

    /**
     * Companion to the test above, covering Devin Review's second finding: two ClientOptions that merely pass the SAME
     * caller-supplied httpClient to Builder.httpClient(...) - the documented pattern where the caller retains lifecycle
     * ownership and close() is a no-op - must stay independent. They are NOT related via from(...), so closing one must
     * not affect the other at all, unlike the raw-OkHttpClient-identity sharing this PR briefly had.
     */
    @Test
    void independentClientsSharingOnlyACallerSuppliedHttpClientStayIndependent() throws Exception {
        ClassLoader loader = compile(Map.of(CORE_PACKAGE + ".ClientOptions", CLIENT_OPTIONS_STAND_IN));
        Class<?> clientOptionsClass = loader.loadClass(CORE_PACKAGE + ".ClientOptions");
        Class<?> builderClass =
                clientOptionsClass.getMethod("builder").invoke(null).getClass();

        okhttp3.OkHttpClient sharedHttpClient = new okhttp3.OkHttpClient();
        Object builderA = clientOptionsClass.getMethod("builder").invoke(null);
        Object optionsA = builderClass
                .getMethod("build")
                .invoke(builderClass
                        .getMethod("httpClient", okhttp3.OkHttpClient.class)
                        .invoke(builderA, sharedHttpClient));

        Object builderB = clientOptionsClass.getMethod("builder").invoke(null);
        Object optionsB = builderClass
                .getMethod("build")
                .invoke(builderClass
                        .getMethod("httpClient", okhttp3.OkHttpClient.class)
                        .invoke(builderB, sharedHttpClient));

        AtomicBoolean bSocketClosed = new AtomicBoolean(false);
        AutoCloseable bSocket = () -> bSocketClosed.set(true);
        optionsB.getClass().getMethod("registerWebSocket", AutoCloseable.class).invoke(optionsB, bSocket);

        optionsA.getClass().getMethod("close").invoke(optionsA);

        assertThat((boolean) optionsB.getClass().getMethod("isClosed").invoke(optionsB))
                .as("A and B were never derived from one another via from(...); closing A must not affect B just"
                        + " because they happen to share a caller-supplied httpClient")
                .isFalse();
        assertThat(bSocketClosed.get())
                .as("B's socket must stay untouched by A's close()")
                .isFalse();
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
        assertTrue(ok, "generated template + generator output must compile:\n" + diagnostics);
        ClassLoader parent = WebSocketLifecycleTemplateSmokeTest.class.getClassLoader();
        return new ClassLoader(parent) {
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
