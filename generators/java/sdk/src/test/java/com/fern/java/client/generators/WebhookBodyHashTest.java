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

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Runtime tests that compile the shipped as-is core utilities ({@code WebhookBodyHash} and {@code WebhookSignature})
 * and exercise them exactly as the generated webhook helper does.
 */
class WebhookBodyHashTest {

    private static final String PACKAGE = "com.seed.webhooks.core";
    private static final String SECRET = "twilio-signing-secret";
    private static final String RAW_BODY = "{\"messageSid\":\"SM123\",\"status\":\"delivered\"}";

    private static Class<?> bodyHashClass;
    private static Class<?> signatureClass;

    @BeforeAll
    static void compileCoreUtilities(@TempDir Path tempDir) throws Exception {
        URLClassLoader classLoader = compileResources(tempDir, "WebhookBodyHash.java", "WebhookSignature.java");
        bodyHashClass = classLoader.loadClass(PACKAGE + ".WebhookBodyHash");
        signatureClass = classLoader.loadClass(PACKAGE + ".WebhookSignature");
    }

    @Test
    void computeHash_matchesJdkDigest() throws Exception {
        assertThat(computeHash(RAW_BODY, "SHA-256", "hex")).isEqualTo(referenceDigest(RAW_BODY, "SHA-256", "hex"));
        assertThat(computeHash(RAW_BODY, "SHA-1", "base64")).isEqualTo(referenceDigest(RAW_BODY, "SHA-1", "base64"));
        assertThat(computeHash(RAW_BODY, "SHA-384", "hex")).isEqualTo(referenceDigest(RAW_BODY, "SHA-384", "hex"));
        assertThat(computeHash(RAW_BODY, "SHA-512", "base64"))
                .isEqualTo(referenceDigest(RAW_BODY, "SHA-512", "base64"));
    }

    @Test
    void getQueryParameter_extractsSingleParameterReadOnly() throws Exception {
        String url = "https://example.com/webhook?foo=bar&bodySHA256=abc123&baz=qux";
        assertThat(getQueryParameter(url, "bodySHA256")).isEqualTo("abc123");
        assertThat(getQueryParameter(url, "foo")).isEqualTo("bar");
    }

    @Test
    void getQueryParameter_decodesPercentEncodedValues() throws Exception {
        String url = "https://example.com/webhook?bodySHA256=a%2Bb%3Dc";
        assertThat(getQueryParameter(url, "bodySHA256")).isEqualTo("a+b=c");
    }

    @Test
    void getQueryParameter_returnsNullWhenMissingOrUnparseable() throws Exception {
        assertThat(getQueryParameter("https://example.com/webhook?foo=bar", "bodySHA256"))
                .isNull();
        assertThat(getQueryParameter("https://example.com/webhook", "bodySHA256"))
                .isNull();
        assertThat(getQueryParameter("::::not a url::::", "bodySHA256")).isNull();
        assertThat(getQueryParameter(null, "bodySHA256")).isNull();
    }

    @Test
    void verifySignature_returnsTrueForValidBodyHashAndSignature() throws Exception {
        String bodyHash = referenceDigest(RAW_BODY, "SHA-256", "hex");
        String url = "https://example.com/webhook?bodySHA256=" + bodyHash;
        String signature = referenceHmac(url, SECRET, "HmacSHA1", "base64");
        assertThat(verify(RAW_BODY, signature, SECRET, url)).isTrue();
    }

    @Test
    void verifySignature_returnsFalseWhenRawBodyIsTampered() throws Exception {
        String bodyHash = referenceDigest(RAW_BODY, "SHA-256", "hex");
        String url = "https://example.com/webhook?bodySHA256=" + bodyHash;
        String signature = referenceHmac(url, SECRET, "HmacSHA1", "base64");
        String tamperedBody = RAW_BODY.replace("delivered", "failed");
        assertThat(verify(tamperedBody, signature, SECRET, url)).isFalse();
    }

    @Test
    void verifySignature_returnsFalseWhenTransmittedBodyHashIsTampered() throws Exception {
        String bodyHash = referenceDigest(RAW_BODY, "SHA-256", "hex");
        String tamperedUrl = "https://example.com/webhook?bodySHA256=" + bodyHash.replace('a', 'b') + "0";
        String signature = referenceHmac(tamperedUrl, SECRET, "HmacSHA1", "base64");
        assertThat(verify(RAW_BODY, signature, SECRET, tamperedUrl)).isFalse();
    }

    @Test
    void verifySignature_returnsFalseWhenHmacSignatureIsTampered() throws Exception {
        String bodyHash = referenceDigest(RAW_BODY, "SHA-256", "hex");
        String url = "https://example.com/webhook?bodySHA256=" + bodyHash;
        String signature = referenceHmac(url, SECRET, "HmacSHA1", "base64");
        String tamperedSignature = flipLastCharacter(signature);
        assertThat(verify(RAW_BODY, tamperedSignature, SECRET, url)).isFalse();
    }

    @Test
    void verifySignature_returnsFalseWhenSecretIsWrong() throws Exception {
        String bodyHash = referenceDigest(RAW_BODY, "SHA-256", "hex");
        String url = "https://example.com/webhook?bodySHA256=" + bodyHash;
        String signature = referenceHmac(url, "wrong-secret", "HmacSHA1", "base64");
        assertThat(verify(RAW_BODY, signature, SECRET, url)).isFalse();
    }

    @Test
    void verifySignature_signsNotificationUrlVerbatim() throws Exception {
        String bodyHash = referenceDigest(RAW_BODY, "SHA-256", "hex");
        // Query parameters intentionally not sorted; the outer HMAC must sign the URL as-is.
        String url = "https://example.com/webhook?z=1&bodySHA256=" + bodyHash + "&a=2";
        String signature = referenceHmac(url, SECRET, "HmacSHA1", "base64");
        assertThat(verify(RAW_BODY, signature, SECRET, url)).isTrue();

        // A signature computed over a reordered URL must NOT verify against the verbatim URL.
        String reorderedUrl = "https://example.com/webhook?a=2&bodySHA256=" + bodyHash + "&z=1";
        String reorderedSignature = referenceHmac(reorderedUrl, SECRET, "HmacSHA1", "base64");
        assertThat(verify(RAW_BODY, reorderedSignature, SECRET, url)).isFalse();
    }

    /**
     * Mirrors the generated {@code SmsStatusWebhooksHelper.verifySignature} two-step check (body-hash comparison before
     * the HMAC verification, failing closed).
     */
    private boolean verify(String requestBody, String signatureHeader, String signatureKey, String notificationUrl)
            throws Exception {
        String expectedBodyHash = computeHash(requestBody, "SHA-256", "hex");
        String transmittedBodyHash = getQueryParameter(notificationUrl, "bodySHA256");
        if (transmittedBodyHash == null || !timingSafeEqual(expectedBodyHash, transmittedBodyHash)) {
            return false;
        }
        String expected = computeHmacSignature(notificationUrl, signatureKey, "HmacSHA1", "base64");
        return timingSafeEqual(signatureHeader, expected);
    }

    private String computeHash(String payload, String algorithm, String encoding) throws Exception {
        Method method = bodyHashClass.getMethod("computeHash", String.class, String.class, String.class);
        return (String) method.invoke(null, payload, algorithm, encoding);
    }

    private String getQueryParameter(String url, String name) throws Exception {
        Method method = bodyHashClass.getMethod("getQueryParameter", String.class, String.class);
        return (String) method.invoke(null, url, name);
    }

    private String computeHmacSignature(String payload, String secret, String algorithm, String encoding)
            throws Exception {
        Method method = signatureClass.getMethod(
                "computeHmacSignature", String.class, String.class, String.class, String.class);
        return (String) method.invoke(null, payload, secret, algorithm, encoding);
    }

    private boolean timingSafeEqual(String left, String right) throws Exception {
        Method method = signatureClass.getMethod("timingSafeEqual", String.class, String.class);
        return (boolean) method.invoke(null, left, right);
    }

    private static String referenceDigest(String payload, String algorithm, String encoding) throws Exception {
        byte[] hash = MessageDigest.getInstance(algorithm).digest(payload.getBytes(StandardCharsets.UTF_8));
        return encode(hash, encoding);
    }

    private static String referenceHmac(String payload, String secret, String algorithm, String encoding)
            throws Exception {
        Mac mac = Mac.getInstance(algorithm);
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), algorithm));
        byte[] signature = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return encode(signature, encoding);
    }

    private static String encode(byte[] bytes, String encoding) {
        if ("hex".equals(encoding)) {
            StringBuilder builder = new StringBuilder(bytes.length * 2);
            for (byte value : bytes) {
                builder.append(Character.forDigit((value >> 4) & 0xf, 16));
                builder.append(Character.forDigit(value & 0xf, 16));
            }
            return builder.toString();
        }
        return Base64.getEncoder().encodeToString(bytes);
    }

    private static String flipLastCharacter(String value) {
        char last = value.charAt(value.length() - 1);
        char replacement = last == 'A' ? 'B' : 'A';
        return value.substring(0, value.length() - 1) + replacement;
    }

    private static URLClassLoader compileResources(Path tempDir, String... resourceNames) throws Exception {
        Path sourceDir = tempDir.resolve("src");
        Path classesDir = tempDir.resolve("classes");
        Path packageDir = sourceDir.resolve(PACKAGE.replace('.', '/'));
        Files.createDirectories(packageDir);
        Files.createDirectories(classesDir);

        for (String resourceName : resourceNames) {
            String contents = readResource("/" + resourceName);
            Path target = packageDir.resolve(resourceName);
            Files.write(target, ("package " + PACKAGE + ";\n\n" + contents).getBytes(StandardCharsets.UTF_8));
        }

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("A JDK (not JRE) is required to run WebhookBodyHashTest");
        }
        String[] javaFiles = new String[resourceNames.length];
        for (int index = 0; index < resourceNames.length; index++) {
            javaFiles[index] =
                    packageDir.resolve(resourceNames[index]).toAbsolutePath().toString();
        }
        String[] arguments = new String[javaFiles.length + 2];
        arguments[0] = "-d";
        arguments[1] = classesDir.toAbsolutePath().toString();
        System.arraycopy(javaFiles, 0, arguments, 2, javaFiles.length);
        int exitCode = compiler.run(null, null, null, arguments);
        if (exitCode != 0) {
            throw new IllegalStateException("Failed to compile core utility resources");
        }
        return new URLClassLoader(new URL[] {classesDir.toUri().toURL()});
    }

    private static String readResource(String resourcePath) throws IOException {
        try (InputStream is = WebhookBodyHashTest.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IllegalStateException("Failed to find resource " + resourcePath);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
