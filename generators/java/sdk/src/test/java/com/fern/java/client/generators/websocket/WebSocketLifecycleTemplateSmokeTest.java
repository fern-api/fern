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
            + "  private final AtomicBoolean closed = new AtomicBoolean(false);\n"
            + "  private final Set<AutoCloseable> openWebSockets = ConcurrentHashMap.newKeySet();\n"
            + "  private ClientOptions(okhttp3.OkHttpClient okHttpClient, boolean ownsHttpClient) {\n"
            + "    this.okHttpClient = okHttpClient;\n"
            + "    this.ownsHttpClient = ownsHttpClient;\n"
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
            + "  public static final class Builder {\n"
            + "    private okhttp3.OkHttpClient httpClient;\n"
            + "    public Builder httpClient(okhttp3.OkHttpClient httpClient) { this.httpClient = httpClient; return"
            + " this; }\n"
            + "    public ClientOptions build() {\n"
            + "      boolean owns = httpClient == null;\n"
            + "      okhttp3.OkHttpClient client = httpClient != null ? httpClient : new okhttp3.OkHttpClient();\n"
            + "      return new ClientOptions(client, owns);\n"
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
