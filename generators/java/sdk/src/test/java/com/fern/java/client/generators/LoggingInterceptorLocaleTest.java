package com.fern.java.client.generators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
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
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Compiles the emitted logging classes and checks that header redaction and log-level parsing do not depend on the JVM
 * default locale (in Turkish/Azerbaijani, "I".toLowerCase() is a dotless "ı").
 */
class LoggingInterceptorLocaleTest {

    private static final String PACKAGE = "com.fern.test.logging";
    private static final String[] RESOURCES = {
        "ILogger", "LogLevel", "LogConfig", "ConsoleLogger", "Logger", "LoggingInterceptor"
    };

    private static URLClassLoader classLoader;

    @BeforeAll
    static void compileEmittedLoggingClasses(@TempDir Path tempDir) throws Exception {
        Path sourceDir = tempDir.resolve("src").resolve(PACKAGE.replace('.', '/'));
        Path classesDir = tempDir.resolve("classes");
        Files.createDirectories(sourceDir);
        Files.createDirectories(classesDir);
        List<String> args = new ArrayList<>(
                List.of("-classpath", System.getProperty("java.class.path"), "-d", classesDir.toString()));
        for (String name : RESOURCES) {
            String contents;
            try (InputStream is = Objects.requireNonNull(
                    LoggingInterceptorGenerator.class.getResourceAsStream("/" + name + ".java"),
                    "/" + name + ".java resource not found")) {
                contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
            Path sourceFile = sourceDir.resolve(name + ".java");
            Files.writeString(sourceFile, "package " + PACKAGE + ";\n\n" + contents);
            args.add(sourceFile.toString());
        }
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        ByteArrayOutputStream diagnostics = new ByteArrayOutputStream();
        int exitCode = compiler.run(null, null, diagnostics, args.toArray(new String[0]));
        if (exitCode != 0) {
            throw new IllegalStateException(
                    "Failed to compile emitted logging classes:\n" + diagnostics.toString(StandardCharsets.UTF_8));
        }
        classLoader = new URLClassLoader(
                new URL[] {classesDir.toUri().toURL()}, LoggingInterceptorLocaleTest.class.getClassLoader());
    }

    @AfterAll
    static void closeClassLoader() throws IOException {
        if (classLoader != null) {
            classLoader.close();
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"en-US", "tr-TR", "az-AZ"})
    void redactsUpperCaseSensitiveHeadersInAnyDefaultLocale(String languageTag) throws Exception {
        List<String> lines = new ArrayList<>();
        Interceptor interceptor = newInterceptor(lines);
        Request request = new Request.Builder()
                .url("https://api.example.com/test")
                .header("AUTHORIZATION", "Bearer request-secret")
                .header("X-API-KEY", "request-api-key")
                .header("X-Version", "2020-09-14")
                .build();
        Response response = new Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(200)
                .message("OK")
                .header("SET-COOKIE", "session=response-cookie")
                .header("Content-Type", "application/json")
                .body(ResponseBody.create("{}", MediaType.get("application/json")))
                .build();
        Interceptor.Chain chain = mock(Interceptor.Chain.class);
        when(chain.request()).thenReturn(request);
        when(chain.proceed(any())).thenReturn(response);

        Locale original = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag(languageTag));
            interceptor.intercept(chain);
        } finally {
            Locale.setDefault(original);
        }

        String log = String.join("\n", lines);
        assertThat(log)
                .contains("AUTHORIZATION=[REDACTED]", "X-API-KEY=[REDACTED]", "SET-COOKIE=[REDACTED]")
                .contains("X-Version=2020-09-14", "Content-Type=application/json")
                .doesNotContain("request-secret", "request-api-key", "response-cookie");
    }

    @ParameterizedTest
    @ValueSource(strings = {"en-US", "tr-TR", "az-AZ"})
    void parsesLogLevelInAnyDefaultLocale(String languageTag) throws Exception {
        Class<?> logLevel = classLoader.loadClass(PACKAGE + ".LogLevel");
        Locale original = Locale.getDefault();
        Object parsed;
        try {
            Locale.setDefault(Locale.forLanguageTag(languageTag));
            parsed = logLevel.getMethod("fromString", String.class).invoke(null, "info");
        } finally {
            Locale.setDefault(original);
        }
        assertThat(parsed.toString()).isEqualTo("INFO");
    }

    private static Interceptor newInterceptor(List<String> lines) throws Exception {
        Class<?> iLogger = classLoader.loadClass(PACKAGE + ".ILogger");
        Class<?> logLevel = classLoader.loadClass(PACKAGE + ".LogLevel");
        Class<?> logger = classLoader.loadClass(PACKAGE + ".Logger");
        Class<?> interceptor = classLoader.loadClass(PACKAGE + ".LoggingInterceptor");
        InvocationHandler capture = (proxy, method, args) -> {
            if (args != null && args.length == 1 && args[0] instanceof String) {
                lines.add((String) args[0]);
            }
            return null;
        };
        Object captureLogger = Proxy.newProxyInstance(classLoader, new Class<?>[] {iLogger}, capture);
        Object debug = logLevel.getField("DEBUG").get(null);
        Object sdkLogger =
                logger.getConstructor(logLevel, iLogger, boolean.class).newInstance(debug, captureLogger, false);
        return (Interceptor) interceptor.getConstructor(logger).newInstance(sdkLogger);
    }
}
