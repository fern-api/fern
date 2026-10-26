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

import com.sun.net.httpserver.HttpServer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Dispatcher;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Compiles the emitted {@code ConcurrencyLimitingInterceptor} and runs real sync and async OkHttp calls through it
 * against a local server that counts how many requests it is serving at once.
 */
class ConcurrencyLimitingInterceptorTest {

    private static final String PACKAGE = "com.fern.test.concurrency";
    private static final String CLASS_NAME = "ConcurrencyLimitingInterceptor";
    private static final int CALLERS = 12;

    private static URLClassLoader classLoader;
    private static Class<?> interceptorClass;

    private HttpServer server;
    private final AtomicInteger inFlight = new AtomicInteger();
    private final AtomicInteger maxInFlight = new AtomicInteger();
    private final AtomicInteger served = new AtomicInteger();

    @BeforeAll
    static void compileEmittedInterceptor(@TempDir Path tempDir) throws Exception {
        String contents;
        try (InputStream is = Objects.requireNonNull(
                ConcurrencyLimitingInterceptorGenerator.class.getResourceAsStream("/" + CLASS_NAME + ".java"),
                "/" + CLASS_NAME + ".java resource not found")) {
            contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        contents = "package " + PACKAGE + ";\n\n" + contents;

        Path sourceDir = tempDir.resolve("src").resolve(PACKAGE.replace('.', '/'));
        Path classesDir = tempDir.resolve("classes");
        Files.createDirectories(sourceDir);
        Files.createDirectories(classesDir);
        Path sourceFile = sourceDir.resolve(CLASS_NAME + ".java");
        Files.writeString(sourceFile, contents);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("A JDK (not JRE) is required to run " + CLASS_NAME + "Test");
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
                    "Failed to compile emitted " + CLASS_NAME + ":\n" + diagnostics.toString(StandardCharsets.UTF_8));
        }
        classLoader = new URLClassLoader(
                new URL[] {classesDir.toUri().toURL()}, ConcurrencyLimitingInterceptorTest.class.getClassLoader());
        interceptorClass = classLoader.loadClass(PACKAGE + "." + CLASS_NAME);
    }

    @AfterAll
    static void closeClassLoader() throws IOException {
        if (classLoader != null) {
            classLoader.close();
        }
    }

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.setExecutor(Executors.newCachedThreadPool());
        server.createContext("/slow", exchange -> {
            int now = inFlight.incrementAndGet();
            maxInFlight.accumulateAndGet(now, Math::max);
            try {
                Thread.sleep(100);
                byte[] body = "ok".getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(200, body.length);
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(body);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                inFlight.decrementAndGet();
                served.incrementAndGet();
            }
        });
        server.start();
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    private static Interceptor newInterceptor(int maxConcurrentRequests) throws Exception {
        return (Interceptor) interceptorClass.getConstructor(int.class).newInstance(maxConcurrentRequests);
    }

    private static int availablePermits(Interceptor interceptor) throws Exception {
        return (int) interceptorClass.getMethod("availablePermits").invoke(interceptor);
    }

    private Request request() {
        return new Request.Builder()
                .url("http://127.0.0.1:" + server.getAddress().getPort() + "/slow")
                .build();
    }

    private static void shutdown(OkHttpClient client) {
        client.dispatcher().executorService().shutdown();
        client.connectionPool().evictAll();
    }

    @Test
    void rejectsNonPositiveLimit() {
        assertThatThrownBy(() -> newInterceptor(0))
                .hasCauseInstanceOf(IllegalArgumentException.class)
                .hasRootCauseMessage("maxConcurrentRequests must be positive");
    }

    @Test
    void boundsSynchronousCallsFromManyThreads() throws Exception {
        Interceptor interceptor = newInterceptor(3);
        OkHttpClient client =
                new OkHttpClient.Builder().addInterceptor(interceptor).build();
        ExecutorService callers = Executors.newFixedThreadPool(CALLERS);
        try {
            List<Future<Integer>> results = new ArrayList<>();
            for (int i = 0; i < CALLERS; i++) {
                results.add(callers.submit(() -> {
                    try (Response response = client.newCall(request()).execute()) {
                        assertThat(response.body().string()).isEqualTo("ok");
                        return response.code();
                    }
                }));
            }
            for (Future<Integer> result : results) {
                assertThat(result.get(30, TimeUnit.SECONDS)).isEqualTo(200);
            }
        } finally {
            callers.shutdownNow();
            shutdown(client);
        }

        assertThat(served.get()).isEqualTo(CALLERS);
        assertThat(maxInFlight.get()).isBetween(2, 3);
        assertThat(availablePermits(interceptor)).isEqualTo(3);
    }

    @Test
    void boundsAsynchronousCallsEnqueuedOnTheDispatcher() throws Exception {
        Interceptor interceptor = newInterceptor(3);
        Dispatcher dispatcher = new Dispatcher();
        dispatcher.setMaxRequestsPerHost(CALLERS);
        OkHttpClient client = new OkHttpClient.Builder()
                .dispatcher(dispatcher)
                .addInterceptor(interceptor)
                .build();
        CountDownLatch done = new CountDownLatch(CALLERS);
        AtomicInteger successes = new AtomicInteger();
        List<Throwable> failures = new ArrayList<>();
        try {
            for (int i = 0; i < CALLERS; i++) {
                client.newCall(request()).enqueue(new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        synchronized (failures) {
                            failures.add(e);
                        }
                        done.countDown();
                    }

                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        try (Response r = response) {
                            if (r.code() == 200 && "ok".equals(r.body().string())) {
                                successes.incrementAndGet();
                            }
                        }
                        done.countDown();
                    }
                });
            }
            assertThat(done.await(30, TimeUnit.SECONDS)).isTrue();
        } finally {
            shutdown(client);
        }

        assertThat(failures).isEmpty();
        assertThat(successes.get()).isEqualTo(CALLERS);
        assertThat(maxInFlight.get()).isBetween(2, 3);
        assertThat(availablePermits(interceptor)).isEqualTo(3);
    }

    @Test
    void holdsPermitUntilResponseBodyIsClosed() throws Exception {
        Interceptor interceptor = newInterceptor(2);
        OkHttpClient client =
                new OkHttpClient.Builder().addInterceptor(interceptor).build();
        try {
            Response first = client.newCall(request()).execute();
            assertThat(availablePermits(interceptor)).isEqualTo(1);
            Response second = client.newCall(request()).execute();
            assertThat(availablePermits(interceptor)).isEqualTo(0);

            first.close();
            assertThat(availablePermits(interceptor)).isEqualTo(1);
            // Reading the body to the end closes it as well; closing twice must not release twice.
            assertThat(second.body().string()).isEqualTo("ok");
            second.close();
            assertThat(availablePermits(interceptor)).isEqualTo(2);
        } finally {
            shutdown(client);
        }
    }

    @Test
    void releasesPermitWhenRequestFails() throws Exception {
        Interceptor interceptor = newInterceptor(1);
        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(interceptor)
                .addInterceptor(chain -> {
                    throw new IOException("boom");
                })
                .build();
        try {
            assertThatThrownBy(() -> client.newCall(request()).execute())
                    .isInstanceOf(IOException.class)
                    .hasMessage("boom");
            assertThat(availablePermits(interceptor)).isEqualTo(1);
        } finally {
            shutdown(client);
        }
    }

    @Test
    void waitingForPermitIsBoundedByCallTimeout() throws Exception {
        Interceptor interceptor = newInterceptor(1);
        OkHttpClient client = new OkHttpClient.Builder()
                .callTimeout(300, TimeUnit.MILLISECONDS)
                .addInterceptor(interceptor)
                .build();
        try {
            Response held = client.newCall(request()).execute();
            assertThat(availablePermits(interceptor)).isEqualTo(0);

            long start = System.nanoTime();
            assertThatThrownBy(() -> client.newCall(request()).execute()).isInstanceOf(InterruptedIOException.class);
            assertThat(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start)).isLessThan(5_000);
            assertThat(availablePermits(interceptor)).isEqualTo(0);

            held.close();
            assertThat(availablePermits(interceptor)).isEqualTo(1);
        } finally {
            shutdown(client);
        }
    }
}
