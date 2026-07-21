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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
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

    @Test
    void verifySignature_returnsFalseForNullInputs() throws Exception {
        String bodyHash = referenceDigest(RAW_BODY, "SHA-256", "hex");
        String url = "https://example.com/webhook?bodySHA256=" + bodyHash;
        String signature = referenceHmac(url, SECRET, "HmacSHA1", "base64");
        assertThat(verify(null, signature, SECRET, url)).isFalse();
        assertThat(verify(RAW_BODY, null, SECRET, url)).isFalse();
        assertThat(verify(RAW_BODY, signature, null, url)).isFalse();
    }

    @Test
    void verifySignature_classicFormPath_signsUrlPlusSortedDedupedParams() throws Exception {
        // Absent bodySHA256 => classic form path: sign URL + sorted/deduped/concatenated body params.
        String url = "https://example.com/webhook";
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("To", "+15551234567");
        params.put("From", "+15559876543");
        params.put("Body", "Hi");
        String bodyString = flattenFormParams(params);
        String signature = referenceHmac(url + bodyString, SECRET, "HmacSHA1", "base64");
        assertThat(verifyForm(params, signature, SECRET, url)).isTrue();

        // Tampering a param value breaks verification.
        Map<String, Object> tampered = new LinkedHashMap<>(params);
        tampered.put("Body", "Bye");
        assertThat(verifyForm(tampered, signature, SECRET, url)).isFalse();
    }

    @Test
    void flattenFormParams_sortsKeysAndDedupsAndSortsValues() {
        // Keys are sorted; per key values are deduped and sorted; concatenated key+value with no delimiter.
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("b", "2");
        params.put("a", Arrays.asList("z", "a", "z")); // duplicate + out-of-order
        // key "a" -> dedup+sort [a, z] -> "aa" + "az"; key "b" -> "b2".
        assertThat(flattenFormParams(params)).isEqualTo("aaazb2");

        Map<String, Object> single = new LinkedHashMap<>();
        single.put("k", "v");
        assertThat(flattenFormParams(single)).isEqualTo("kv");
    }

    @Test
    void notificationUrlCandidates_asIsWhenPortVariantsDisabled() throws Exception {
        assertThat(candidates("https://example.com/webhook?a=1", false, false))
                .containsExactly("https://example.com/webhook?a=1");
    }

    @Test
    void notificationUrlCandidates_addsStandardPortAndNoPortForms() throws Exception {
        assertThat(candidates("https://example.com/webhook?a=1", true, false))
                .containsExactly(
                        "https://example.com/webhook?a=1", "https://example.com:443/webhook?a=1");
        assertThat(candidates("http://example.com/webhook", true, false))
                .containsExactly("http://example.com/webhook", "http://example.com:80/webhook");
    }

    @Test
    void notificationUrlCandidates_collapsesFormThatAlreadyCarriesStandardPort() throws Exception {
        assertThat(candidates("https://example.com:443/webhook", true, false))
                .containsExactly("https://example.com:443/webhook", "https://example.com/webhook");
    }

    @Test
    void notificationUrlCandidates_reEncodesQueryWithLegacyEncoding() throws Exception {
        assertThat(candidates("https://example.com/webhook?a=b%20c&x=1", true, true))
                .containsExactly(
                        "https://example.com/webhook?a=b%20c&x=1",
                        "https://example.com:443/webhook?a=b%20c&x=1",
                        "https://example.com/webhook?a=b+c&x=1",
                        "https://example.com:443/webhook?a=b+c&x=1");
    }

    @Test
    void notificationUrlCandidates_unparseableOrNullYieldsSingleton() throws Exception {
        assertThat(candidates("::::not a url::::", true, true)).containsExactly("::::not a url::::");
        assertThat(candidates(null, true, true)).containsExactly((String) null);
    }

    @Test
    void verifySignature_anyMatchAcceptsStandardPortSignedUrl() throws Exception {
        // Twilio signs the URL with the standard port added; caller supplies the port-less URL.
        String callerUrl = "https://mycompany.com/myapp?bodySHA256=" + referenceDigest(RAW_BODY, "SHA-256", "hex");
        String signedUrl = "https://mycompany.com:443/myapp?bodySHA256=" + referenceDigest(RAW_BODY, "SHA-256", "hex");
        String signature = referenceHmac(signedUrl, SECRET, "HmacSHA1", "base64");
        assertThat(verify(RAW_BODY, signature, SECRET, callerUrl)).isTrue();
    }

    /**
     * Mirrors the generated {@code SmsStatusWebhooksHelper.verifySignature(String, ...)}: body-hash check runs once (JSON
     * path only) above a candidate loop that ORs constant-time HMAC comparisons; the JSON path signs the URL only, the
     * classic form path signs URL + body, and any candidate match accepts.
     */
    private boolean verify(String requestBody, String signatureHeader, String signatureKey, String notificationUrl)
            throws Exception {
        if (requestBody == null || requestBody.isEmpty() || signatureHeader == null || signatureKey == null) {
            return false;
        }
        String transmittedBodyHash = getQueryParameter(notificationUrl, "bodySHA256");
        if (transmittedBodyHash != null) {
            String expectedBodyHash = computeHash(requestBody, "SHA-256", "hex");
            if (!timingSafeEqual(expectedBodyHash, transmittedBodyHash)) {
                return false;
            }
        }
        for (String candidateUrl : candidates(notificationUrl, true, true)) {
            String payload = transmittedBodyHash != null ? candidateUrl : candidateUrl + requestBody;
            String expected = computeHmacSignature(payload, signatureKey, "HmacSHA1", "base64");
            if (timingSafeEqual(signatureHeader, expected)) {
                return true;
            }
        }
        return false;
    }

    /** Mirrors the {@code Map<String, ?>} overload: flatten the form params, then verify via the string overload. */
    private boolean verifyForm(
            Map<String, Object> requestBody, String signatureHeader, String signatureKey, String notificationUrl)
            throws Exception {
        if (requestBody == null) {
            return false;
        }
        return verify(flattenFormParams(requestBody), signatureHeader, signatureKey, notificationUrl);
    }

    /** Mirrors the generated map-overload flattening exactly. */
    private static String flattenFormParams(Map<String, Object> requestBody) {
        StringBuilder bodyString = new StringBuilder();
        for (String key : new TreeSet<>(requestBody.keySet())) {
            Object value = requestBody.get(key);
            TreeSet<String> values = new TreeSet<>();
            if (value instanceof Iterable) {
                for (Object item : (Iterable<?>) value) {
                    values.add(String.valueOf(item));
                }
            } else {
                values.add(String.valueOf(value));
            }
            for (String sortedValue : values) {
                bodyString.append(key).append(sortedValue);
            }
        }
        return bodyString.toString();
    }

    @SuppressWarnings("unchecked")
    private List<String> candidates(String url, boolean portVariants, boolean legacyQueryEncoding) throws Exception {
        Method method = signatureClass.getMethod(
                "notificationUrlCandidates", String.class, boolean.class, boolean.class);
        return new ArrayList<>((List<String>) method.invoke(null, url, portVariants, legacyQueryEncoding));
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
