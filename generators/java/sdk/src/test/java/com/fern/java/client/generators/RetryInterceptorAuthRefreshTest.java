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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.Protocol;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Compiles the {@code RetryInterceptor} emitted with {@code refresh-auth-on-failed-permissions} enabled and checks that
 * 401 and 403 responses refresh auth and retry under the normal retry policy.
 */
class RetryInterceptorAuthRefreshTest {

    private static final String PACKAGE = "com.fern.test.retry.authrefresh";
    private static final String CLASS_NAME = "RetryInterceptor";

    private static URLClassLoader classLoader;
    private static Class<?> interceptorClass;
    private static Class<?> authRefreshClass;

    @BeforeAll
    static void compileEmittedInterceptor(@TempDir Path tempDir) throws Exception {
        String contents;
        try (InputStream is = Objects.requireNonNull(
                RetryInterceptorGenerator.class.getResourceAsStream("/RetryInterceptor.java"),
                "/RetryInterceptor.java resource not found")) {
            contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        contents = "package " + PACKAGE + ";\n\n"
                + RetryInterceptorGenerator.addAuthRefresh(contents.replace(
                        "{{RETRY_STATUS_CHECK}}",
                        "statusCode == 408 || statusCode == 429 || statusCode == 502 || statusCode == 503"
                                + " || statusCode == 504"));

        Path sourceDir = tempDir.resolve("src").resolve(PACKAGE.replace('.', '/'));
        Path classesDir = tempDir.resolve("classes");
        Files.createDirectories(sourceDir);
        Files.createDirectories(classesDir);
        Path sourceFile = sourceDir.resolve(CLASS_NAME + ".java");
        Files.writeString(sourceFile, contents);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("A JDK (not JRE) is required to run RetryInterceptorAuthRefreshTest");
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
        classLoader = new URLClassLoader(
                new URL[] {classesDir.toUri().toURL()}, RetryInterceptorAuthRefreshTest.class.getClassLoader());
        interceptorClass = classLoader.loadClass(PACKAGE + "." + CLASS_NAME);
        authRefreshClass = classLoader.loadClass(PACKAGE + "." + CLASS_NAME + "$AuthRefresh");
    }

    @AfterAll
    static void closeClassLoader() throws IOException {
        if (classLoader != null) {
            classLoader.close();
        }
    }

    private static Interceptor newInterceptor(int maxRetries) throws Exception {
        return (Interceptor) interceptorClass
                .getConstructor(int.class, Optional.class, Optional.class, Optional.class)
                .newInstance(maxRetries, Optional.of(1L), Optional.of(1L), Optional.of(0.0));
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private static Request request(Supplier<Map<String, String>> refresh) throws Exception {
        Request.Builder builder =
                new Request.Builder().url("https://api.example.com/test").header("Authorization", "Bearer old");
        if (refresh != null) {
            Object authRefresh = authRefreshClass.getConstructor(Supplier.class).newInstance(refresh);
            builder.tag((Class) authRefreshClass, authRefresh);
        }
        return builder.build();
    }

    private static Response response(Request request, int code, String body) {
        return new Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(code)
                .message("")
                .body(ResponseBody.create(body, MediaType.get("text/plain")))
                .build();
    }

    /** A chain that records the Authorization header of every attempt and answers with the given status codes. */
    private static Interceptor.Chain chain(Request request, List<String> sentAuthorization, int... codes)
            throws Exception {
        Interceptor.Chain chain = mock(Interceptor.Chain.class);
        when(chain.request()).thenReturn(request);
        AtomicInteger attempt = new AtomicInteger();
        when(chain.proceed(any())).thenAnswer(invocation -> {
            Request sent = invocation.getArgument(0);
            sentAuthorization.add(sent.header("Authorization"));
            int code = codes[Math.min(attempt.getAndIncrement(), codes.length - 1)];
            return response(sent, code, "status " + code);
        });
        return chain;
    }

    private static Supplier<Map<String, String>> rotatingToken(AtomicInteger refreshes) {
        return () -> Map.of("Authorization", "Bearer new-" + refreshes.incrementAndGet());
    }

    @Test
    void refreshesAuthAndRetriesOn401() throws Exception {
        AtomicInteger refreshes = new AtomicInteger();
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain = chain(request(rotatingToken(refreshes)), sent, 401, 200);

        Response response = newInterceptor(2).intercept(chain);

        assertThat(response.code()).isEqualTo(200);
        assertThat(refreshes.get()).isEqualTo(1);
        assertThat(sent).containsExactly("Bearer old", "Bearer new-1");
    }

    @Test
    void refreshesAuthAndRetriesOn403() throws Exception {
        AtomicInteger refreshes = new AtomicInteger();
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain = chain(request(rotatingToken(refreshes)), sent, 403, 200);

        Response response = newInterceptor(2).intercept(chain);

        assertThat(response.code()).isEqualTo(200);
        assertThat(sent).containsExactly("Bearer old", "Bearer new-1");
    }

    @Test
    void refreshesBeforeEveryAuthFailureRetryUpToMaxRetries() throws Exception {
        AtomicInteger refreshes = new AtomicInteger();
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain = chain(request(rotatingToken(refreshes)), sent, 401);

        Response response = newInterceptor(2).intercept(chain);

        assertThat(response.code()).isEqualTo(401);
        assertThat(refreshes.get()).isEqualTo(2);
        assertThat(sent).containsExactly("Bearer old", "Bearer new-1", "Bearer new-2");
    }

    @Test
    void keepsRefreshedAuthForLaterRetriesThatAreNotAuthFailures() throws Exception {
        AtomicInteger refreshes = new AtomicInteger();
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain = chain(request(rotatingToken(refreshes)), sent, 401, 503, 200);

        Response response = newInterceptor(3).intercept(chain);

        assertThat(response.code()).isEqualTo(200);
        assertThat(refreshes.get()).isEqualTo(1);
        assertThat(sent).containsExactly("Bearer old", "Bearer new-1", "Bearer new-1");
    }

    @Test
    void removesAuthHeaderThatRefreshNoLongerProvides() throws Exception {
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain =
                chain(request(() -> java.util.Collections.singletonMap("Authorization", null)), sent, 401, 200);

        Response response = newInterceptor(2).intercept(chain);

        assertThat(response.code()).isEqualTo(200);
        assertThat(sent).containsExactly("Bearer old", null);
    }

    @Test
    void doesNotSendRequestAgainWhenRefreshFails() throws Exception {
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain = chain(
                request(() -> {
                    throw new IllegalStateException("token endpoint unavailable");
                }),
                sent,
                401,
                200);

        assertThatThrownBy(() -> newInterceptor(2).intercept(chain))
                .isInstanceOf(IOException.class)
                .hasMessageContaining("401")
                .hasRootCauseMessage("token endpoint unavailable");
        verify(chain, times(1)).proceed(any());
    }

    @Test
    void doesNotRetryAuthFailureWithoutAuthRefreshTag() throws Exception {
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain = chain(request(null), sent, 401, 200);

        Response response = newInterceptor(2).intercept(chain);

        assertThat(response.code()).isEqualTo(401);
        verify(chain, times(1)).proceed(any());
    }

    @Test
    void stillRetriesOrdinaryRetryableStatusesWithoutRefreshingAuth() throws Exception {
        AtomicInteger refreshes = new AtomicInteger();
        List<String> sent = new ArrayList<>();
        Interceptor.Chain chain = chain(request(rotatingToken(refreshes)), sent, 429, 200);

        Response response = newInterceptor(2).intercept(chain);

        assertThat(response.code()).isEqualTo(200);
        assertThat(refreshes.get()).isEqualTo(0);
        assertThat(sent).containsExactly("Bearer old", "Bearer old");
    }
}
