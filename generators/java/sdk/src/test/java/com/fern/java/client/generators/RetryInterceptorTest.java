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
import java.util.Objects;
import java.util.Optional;
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
}
