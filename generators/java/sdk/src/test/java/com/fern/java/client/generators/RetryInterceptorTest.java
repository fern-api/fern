/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.fern.java.client.generators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sun.net.httpserver.HttpServer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.InetSocketAddress;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Dispatcher;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Protocol;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Compiles the emitted {@code RetryInterceptor} and drives it through a fake {@link Interceptor.Chain} to pin down how
 * it behaves when a retry attempt fails after the API has already answered.
 */
class RetryInterceptorTest {

    private static final String PACKAGE = "com.fern.test.retry";
    private static final String CLASS_NAME = "RetryInterceptor";
    private static final Request REQUEST =
            new Request.Builder().url("https://api.example.com/test").build();

    private static URLClassLoader classLoader;
    private static Class<?> interceptorClass;
    private static Class<?> asyncCallClass;

    @BeforeAll
    static void compileEmittedInterceptor(@TempDir Path tempDir) throws Exception {
        String contents;
        try (InputStream is = Objects.requireNonNull(
                RetryInterceptorGenerator.class.getResourceAsStream("/RetryInterceptor.java"),
                "/RetryInterceptor.java resource not found")) {
            contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        contents = "package " + PACKAGE + ";\n\n"
                + contents.replace(
                        "{{RETRY_STATUS_CHECK}}",
                        "statusCode == 408 || statusCode == 429 || statusCode == 502 || statusCode == 503"
                                + " || statusCode == 504");

        Path sourceDir = tempDir.resolve("src").resolve(PACKAGE.replace('.', '/'));
        Path classesDir = tempDir.resolve("classes");
        Files.createDirectories(sourceDir);
        Files.createDirectories(classesDir);
        Path sourceFile = sourceDir.resolve(CLASS_NAME + ".java");
        Files.writeString(sourceFile, contents);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("A JDK (not JRE) is required to run RetryInterceptorTest");
        }
        ByteArrayOutputStream diagnostics = new ByteArrayOutputStream();
        int exitCode = compiler.run(
                null,
                null,
                diagnostics,
                "-classpath",
                System.getProperty("java.class.path"),
                "-d",
                classesDir.toAbsolutePath().toString(),
                sourceFile.toAbsolutePath().toString());
        if (exitCode != 0) {
            throw new IllegalStateException(
                    "Failed to compile emitted RetryInterceptor:\n" + diagnostics.toString(StandardCharsets.UTF_8));
        }
        classLoader =
                new URLClassLoader(new URL[] {classesDir.toUri().toURL()}, RetryInterceptorTest.class.getClassLoader());
        interceptorClass = classLoader.loadClass(PACKAGE + "." + CLASS_NAME);
        asyncCallClass = classLoader.loadClass(PACKAGE + "." + CLASS_NAME + "$AsyncCall");
    }

    @AfterAll
    static void closeClassLoader() throws IOException {
        if (classLoader != null) {
            classLoader.close();
        }
    }

    private static Interceptor newInterceptor(int maxRetries) throws Exception {
        return newInterceptor(maxRetries, 1L);
    }

    private static Interceptor newInterceptor(int maxRetries, long maxRetryDelayMillis) throws Exception {
        return (Interceptor) interceptorClass
                .getConstructor(int.class, Optional.class, Optional.class, Optional.class)
                .newInstance(maxRetries, Optional.of(1L), Optional.of(maxRetryDelayMillis), Optional.of(0.0));
    }

    private static Response response(int code, String body) {
        return new Response.Builder()
                .request(REQUEST)
                .protocol(Protocol.HTTP_1_1)
                .code(code)
                .message("")
                .body(ResponseBody.create(body, MediaType.get("text/plain")))
                .build();
    }

    private static Interceptor.Chain chain() {
        Interceptor.Chain chain = mock(Interceptor.Chain.class);
        when(chain.request()).thenReturn(REQUEST);
        return chain;
    }

    @Test
    void returnsPreviousResponseWhenRetryAttemptFails() throws Exception {
        Interceptor.Chain chain = chain();
        when(chain.proceed(any())).thenReturn(response(429, "Rate limited")).thenThrow(new IOException("Canceled"));

        Response response = newInterceptor(3).intercept(chain);

        assertThat(response.code()).isEqualTo(429);
        assertThat(response.body().string()).isEqualTo("Rate limited");
        verify(chain, times(2)).proceed(any());
    }

    @Test
    void returnsSuccessfulRetryResponse() throws Exception {
        Interceptor.Chain chain = chain();
        when(chain.proceed(any())).thenReturn(response(429, "Rate limited")).thenReturn(response(200, "Success"));

        Response response = newInterceptor(3).intercept(chain);

        assertThat(response.code()).isEqualTo(200);
        assertThat(response.body().string()).isEqualTo("Success");
        verify(chain, times(2)).proceed(any());
    }

    @Test
    void returnsLastResponseWhenRetriesAreExhausted() throws Exception {
        Interceptor.Chain chain = chain();
        when(chain.proceed(any()))
                .thenReturn(response(503, "first"))
                .thenReturn(response(503, "second"))
                .thenReturn(response(503, "third"));

        Response response = newInterceptor(2).intercept(chain);

        assertThat(response.code()).isEqualTo(503);
        assertThat(response.body().string()).isEqualTo("third");
        verify(chain, times(3)).proceed(any());
    }

    @Test
    void doesNotRetryNonRetryableResponse() throws Exception {
        Interceptor.Chain chain = chain();
        when(chain.proceed(any())).thenReturn(response(400, "Bad request"));

        Response response = newInterceptor(3).intercept(chain);

        assertThat(response.code()).isEqualTo(400);
        verify(chain, times(1)).proceed(any());
    }

    @Test
    void propagatesFailureOfFirstAttempt() throws Exception {
        Interceptor.Chain chain = chain();
        when(chain.proceed(any())).thenThrow(new IOException("Canceled"));

        assertThatThrownBy(() -> newInterceptor(3).intercept(chain))
                .isInstanceOf(IOException.class)
                .hasMessage("Canceled");
    }

    /**
     * The server asks for a {@code Retry-After} wait that is longer than the client's call timeout. With a single
     * timeout across the whole retry loop the call is cancelled while sleeping and OkHttp throws before the retry ever
     * runs; the timeout must instead apply to each attempt on its own.
     */
    @Test
    void callTimeoutAppliesPerAttemptNotAcrossRetryAfterWait() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/test", exchange -> {
            byte[] body;
            if (requests.incrementAndGet() == 1) {
                body = "Rate limited".getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("Retry-After", "2");
                exchange.sendResponseHeaders(429, body.length);
            } else {
                body = "Success".getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(200, body.length);
            }
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(body);
            }
        });
        server.start();
        try {
            OkHttpClient client = new OkHttpClient.Builder()
                    .callTimeout(1500, TimeUnit.MILLISECONDS)
                    .addInterceptor(newInterceptor(3, 60_000L))
                    .build();
            Request request = new Request.Builder()
                    .url("http://127.0.0.1:" + server.getAddress().getPort() + "/test")
                    .build();

            try (Response response = client.newCall(request).execute()) {
                assertThat(response.code()).isEqualTo(200);
                assertThat(response.body().string()).isEqualTo("Success");
            }
            assertThat(requests.get()).isEqualTo(2);
            client.dispatcher().executorService().shutdown();
            client.connectionPool().evictAll();
        } finally {
            server.stop(0);
        }
    }

    @Test
    void syncInterruptDuringBackoffRestoresInterruptFlag() throws Exception {
        Interceptor.Chain chain = chain();
        when(chain.proceed(any()))
                .thenReturn(response(429, "Rate limited")
                        .newBuilder()
                        .header("Retry-After", "30")
                        .build());
        Interceptor interceptor = newInterceptor(3, 60_000L);
        AtomicReference<Throwable> thrown = new AtomicReference<>();
        AtomicReference<Boolean> interruptFlag = new AtomicReference<>();
        Thread thread = new Thread(() -> {
            try {
                interceptor.intercept(chain);
            } catch (Throwable t) {
                thrown.set(t);
            }
            interruptFlag.set(Thread.currentThread().isInterrupted());
        });
        thread.start();
        Thread.sleep(200);
        thread.interrupt();
        thread.join(5_000);

        assertThat(thread.isAlive()).isFalse();
        assertThat(thrown.get()).isInstanceOf(InterruptedIOException.class);
        assertThat(interruptFlag.get()).isTrue();
        verify(chain, times(1)).proceed(any());
    }

    /**
     * A call waiting to retry must not hold one of the dispatcher's per-host slots: with a single slot, an unrelated
     * call to the same host has to go out while the first call is still backing off.
     */
    @Test
    void asyncBackoffDoesNotHoldDispatcherSlot() throws Exception {
        try (TestServer server = new TestServer("2")) {
            OkHttpClient client = asyncClient(newInterceptor(3, 60_000L));
            CapturingCallback limited = new CapturingCallback();
            enqueue(newAsyncCall(client, server.request("/limited")), limited);
            server.awaitLimitedRequests(1);

            long start = System.nanoTime();
            CapturingCallback other = new CapturingCallback();
            enqueue(newAsyncCall(client, server.request("/other")), other);
            assertThat(other.response().code()).isEqualTo(200);
            assertThat(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start)).isLessThan(1_000L);

            assertThat(limited.result.isDone()).isFalse();
            assertThat(limited.response().code()).isEqualTo(200);
            assertThat(server.limitedRequests.get()).isEqualTo(2);
            shutdown(client);
        }
    }

    @Test
    void cancellingAsyncCallDuringBackoffStopsRetries() throws Exception {
        try (TestServer server = new TestServer("1")) {
            OkHttpClient client = asyncClient(newInterceptor(3, 60_000L));
            CapturingCallback callback = new CapturingCallback();
            Object call = newAsyncCall(client, server.request("/limited"));
            enqueue(call, callback);
            server.awaitLimitedRequests(1);
            Thread.sleep(100);

            asyncCallClass.getMethod("cancel").invoke(call);
            assertThat(callback.result.get(1, TimeUnit.SECONDS)).isInstanceOf(IOException.class);

            CapturingCallback other = new CapturingCallback();
            enqueue(newAsyncCall(client, server.request("/other")), other);
            assertThat(other.response().code()).isEqualTo(200);

            Thread.sleep(1_500);
            assertThat(server.limitedRequests.get()).isEqualTo(1);
            assertThat(callback.deliveries.get()).isEqualTo(1);
            shutdown(client);
        }
    }

    @Test
    void asyncCallWithZeroMaxRetriesReturnsFirstResponse() throws Exception {
        try (TestServer server = new TestServer("30")) {
            OkHttpClient client = asyncClient(newInterceptor(0, 60_000L));
            CapturingCallback callback = new CapturingCallback();
            long start = System.nanoTime();
            enqueue(newAsyncCall(client, server.request("/limited")), callback);

            assertThat(callback.response().code()).isEqualTo(429);
            assertThat(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start)).isLessThan(1_000L);
            assertThat(server.limitedRequests.get()).isEqualTo(1);
            shutdown(client);
        }
    }

    @Test
    void asyncCallHonoursPerRequestMaxRetriesOverride() throws Exception {
        try (TestServer server = new TestServer("1")) {
            OkHttpClient client = asyncClient(newInterceptor(0, 60_000L));
            Object override = interceptorClass
                    .getClassLoader()
                    .loadClass(PACKAGE + "." + CLASS_NAME + "$MaxRetriesOverride")
                    .getConstructor(int.class)
                    .newInstance(2);
            @SuppressWarnings("unchecked")
            Class<Object> overrideClass = (Class<Object>) override.getClass();
            Request request = server.request("/limited")
                    .newBuilder()
                    .tag(overrideClass, override)
                    .build();
            CapturingCallback callback = new CapturingCallback();
            enqueue(newAsyncCall(client, request), callback);

            assertThat(callback.response().code()).isEqualTo(200);
            assertThat(server.limitedRequests.get()).isEqualTo(2);
            shutdown(client);
        }
    }

    private static OkHttpClient asyncClient(Interceptor interceptor) {
        Dispatcher dispatcher = new Dispatcher();
        dispatcher.setMaxRequestsPerHost(1);
        return new OkHttpClient.Builder()
                .dispatcher(dispatcher)
                .addInterceptor(interceptor)
                .build();
    }

    private static void shutdown(OkHttpClient client) {
        client.dispatcher().executorService().shutdown();
        client.connectionPool().evictAll();
    }

    private static Object newAsyncCall(OkHttpClient client, Request request) throws Exception {
        Method method = interceptorClass.getMethod("newAsyncCall", OkHttpClient.class, Request.class);
        return method.invoke(null, client, request);
    }

    private static void enqueue(Object asyncCall, Callback callback) throws Exception {
        try {
            asyncCallClass.getMethod("enqueue", Callback.class).invoke(asyncCall, callback);
        } catch (InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    private static final class CapturingCallback implements Callback {
        private final CompletableFuture<Object> result = new CompletableFuture<>();
        private final AtomicInteger deliveries = new AtomicInteger();

        @Override
        public void onResponse(Call call, Response response) {
            deliveries.incrementAndGet();
            try (Response closing = response) {
                result.complete(new Response.Builder()
                        .request(closing.request())
                        .protocol(closing.protocol())
                        .code(closing.code())
                        .message(closing.message())
                        .build());
            }
        }

        @Override
        public void onFailure(Call call, IOException e) {
            deliveries.incrementAndGet();
            result.complete(e);
        }

        Response response() throws Exception {
            Object value = result.get(10, TimeUnit.SECONDS);
            if (value instanceof IOException) {
                throw (IOException) value;
            }
            return (Response) value;
        }
    }

    /** {@code /limited} answers 429 with the given {@code Retry-After} once, then 200; {@code /other} answers 200. */
    private static final class TestServer implements AutoCloseable {
        private final HttpServer server;
        private final AtomicInteger limitedRequests = new AtomicInteger();

        TestServer(String retryAfter) throws IOException {
            server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
            server.createContext("/limited", exchange -> {
                if (limitedRequests.incrementAndGet() == 1) {
                    exchange.getResponseHeaders().add("Retry-After", retryAfter);
                    exchange.sendResponseHeaders(429, -1);
                } else {
                    exchange.sendResponseHeaders(200, -1);
                }
                exchange.close();
            });
            server.createContext("/other", exchange -> {
                exchange.sendResponseHeaders(200, -1);
                exchange.close();
            });
            server.start();
        }

        Request request(String path) {
            return new Request.Builder()
                    .url("http://127.0.0.1:" + server.getAddress().getPort() + path)
                    .build();
        }

        void awaitLimitedRequests(int count) throws InterruptedException {
            long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
            while (limitedRequests.get() < count && System.nanoTime() < deadline) {
                Thread.sleep(10);
            }
            assertThat(limitedRequests.get()).isEqualTo(count);
        }

        @Override
        public void close() {
            server.stop(0);
        }
    }
}
