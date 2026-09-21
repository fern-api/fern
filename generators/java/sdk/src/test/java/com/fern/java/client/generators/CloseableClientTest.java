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

import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.lang.model.element.Modifier;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import okhttp3.OkHttpClient;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Compiles the exact {@code close()} method that {@link AbstractRootClientGenerator} emits into the generated root
 * clients (when {@code enable-closeable-client} is enabled) against a real {@link OkHttpClient}, so the ownership
 * semantics are verified on the code SDK consumers actually receive rather than a hand-written copy.
 */
public class CloseableClientTest {

    private static final String PACKAGE = "com.fern.test.closeable";
    private static final String CLASS_NAME = "CloseableRootClient";

    private static URLClassLoader classLoader;
    private static Class<?> clientClass;

    /** Stand-in for the generated {@code ClientOptions}, exposing only what the emitted {@code close()} touches. */
    public interface ClientOptions {
        boolean ownsHttpClient();

        OkHttpClient httpClient();
    }

    private static final class FixedClientOptions implements ClientOptions {
        private final boolean ownsHttpClient;
        private final OkHttpClient httpClient;

        FixedClientOptions(boolean ownsHttpClient, OkHttpClient httpClient) {
            this.ownsHttpClient = ownsHttpClient;
            this.httpClient = httpClient;
        }

        @Override
        public boolean ownsHttpClient() {
            return ownsHttpClient;
        }

        @Override
        public OkHttpClient httpClient() {
            return httpClient;
        }
    }

    @BeforeAll
    static void compileEmittedClient(@TempDir Path tempDir) throws Exception {
        TypeSpec type = TypeSpec.classBuilder(CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addSuperinterface(AutoCloseable.class)
                .addField(FieldSpec.builder(ClientOptions.class, "clientOptions", Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(ClientOptions.class, "clientOptions")
                        .addStatement("this.clientOptions = clientOptions")
                        .build())
                .addMethod(AbstractRootClientGenerator.buildCloseMethod())
                .build();

        Path sourceDir = tempDir.resolve("src");
        Path classesDir = tempDir.resolve("classes");
        Files.createDirectories(classesDir);
        JavaFile.builder(PACKAGE, type).build().writeTo(sourceDir);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("A JDK (not JRE) is required to run CloseableClientTest");
        }
        Path sourceFile = sourceDir.resolve(PACKAGE.replace('.', '/')).resolve(CLASS_NAME + ".java");
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
            throw new IllegalStateException("Failed to compile emitted close():\n"
                    + diagnostics.toString(StandardCharsets.UTF_8) + "\n\nSOURCE:\n"
                    + Files.readString(sourceFile));
        }
        classLoader =
                new URLClassLoader(new URL[] {classesDir.toUri().toURL()}, CloseableClientTest.class.getClassLoader());
        clientClass = classLoader.loadClass(PACKAGE + "." + CLASS_NAME);
    }

    @AfterAll
    static void closeClassLoader() throws Exception {
        classLoader.close();
    }

    private static AutoCloseable newClient(boolean ownsHttpClient, OkHttpClient httpClient) throws Exception {
        return (AutoCloseable) clientClass
                .getConstructor(ClientOptions.class)
                .newInstance(new FixedClientOptions(ownsHttpClient, httpClient));
    }

    @Test
    void closeDeclaresNoCheckedException() throws Exception {
        assertThat(clientClass.getMethod("close").getExceptionTypes()).isEmpty();
    }

    @Test
    void closeShutsDownSdkOwnedClient() throws Exception {
        OkHttpClient httpClient = new OkHttpClient();
        try (AutoCloseable client = newClient(true, httpClient)) {
            assertThat(httpClient.dispatcher().executorService().isShutdown()).isFalse();
        }
        assertThat(httpClient.dispatcher().executorService().isShutdown()).isTrue();
    }

    @Test
    void closeLeavesCallerOwnedClientUntouched() throws Exception {
        OkHttpClient callerClient = new OkHttpClient();
        // Mirrors ClientOptions.Builder.build(): the SDK derives its client via newBuilder(), which shares the
        // caller's Dispatcher and ConnectionPool.
        OkHttpClient derived = callerClient.newBuilder().build();
        assertThat(derived.dispatcher()).isSameAs(callerClient.dispatcher());
        assertThat(derived.connectionPool()).isSameAs(callerClient.connectionPool());

        try (AutoCloseable client = newClient(false, derived)) {
            // no-op
        }
        assertThat(callerClient.dispatcher().executorService().isShutdown()).isFalse();
        callerClient.dispatcher().executorService().shutdown();
    }

    @Test
    void closeIsIdempotent() throws Exception {
        OkHttpClient httpClient = new OkHttpClient();
        AutoCloseable client = newClient(true, httpClient);
        client.close();
        client.close();
        assertThat(httpClient.dispatcher().executorService().isShutdown()).isTrue();
    }
}
