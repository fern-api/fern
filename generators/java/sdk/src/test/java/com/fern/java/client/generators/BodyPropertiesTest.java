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

import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import okio.Buffer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/** Runtime tests that compile the shipped as-is {@code BodyProperties} core utility and exercise its merge logic. */
class BodyPropertiesTest {

    private static final String PACKAGE = "com.seed.plants.core";

    private static final String OBJECT_MAPPERS_SOURCE = "import com.fasterxml.jackson.databind.ObjectMapper;\n"
            + "import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;\n"
            + "public final class ObjectMappers {\n"
            + "    public static final ObjectMapper JSON_MAPPER = new ObjectMapper().registerModule(new Jdk8Module());\n"
            + "    private ObjectMappers() {}\n"
            + "}\n";

    private static Class<?> bodyPropertiesClass;
    private static Class<?> objectMappersClass;

    @BeforeAll
    static void compileCoreUtilities(@TempDir Path tempDir) throws Exception {
        Path sourceDir = tempDir.resolve("src");
        Path classesDir = tempDir.resolve("classes");
        Path packageDir = sourceDir.resolve(PACKAGE.replace('.', '/'));
        Files.createDirectories(packageDir);
        Files.createDirectories(classesDir);

        Path bodyProperties = writeSource(packageDir, "BodyProperties.java", readResource("/BodyProperties.java"));
        Path mediaTypes = writeSource(packageDir, "MediaTypes.java", readResource("/MediaTypes.java"));
        Path objectMappers = writeSource(packageDir, "ObjectMappers.java", OBJECT_MAPPERS_SOURCE);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("A JDK (not JRE) is required to run BodyPropertiesTest");
        }
        int exitCode = compiler.run(
                null,
                null,
                null,
                "-classpath",
                System.getProperty("java.class.path"),
                "-d",
                classesDir.toAbsolutePath().toString(),
                bodyProperties.toAbsolutePath().toString(),
                mediaTypes.toAbsolutePath().toString(),
                objectMappers.toAbsolutePath().toString());
        if (exitCode != 0) {
            throw new IllegalStateException("Failed to compile core utility resources");
        }
        URLClassLoader classLoader = new URLClassLoader(
                new URL[] {classesDir.toUri().toURL()}, BodyPropertiesTest.class.getClassLoader());
        bodyPropertiesClass = classLoader.loadClass(PACKAGE + ".BodyProperties");
        objectMappersClass = classLoader.loadClass(PACKAGE + ".ObjectMappers");
    }

    @Test
    void merge_withoutBodyProperties_returnsBodyUnchanged() throws Exception {
        Map<String, Object> body = Map.of("name", "fern");
        assertThat(merge(body, null)).isSameAs(body);
        assertThat(merge(body, Map.of())).isSameAs(body);
        assertThat(merge(null, null)).isNull();
    }

    @Test
    void merge_bodyPropertyOverridesBodyPropertyWithSameKey() throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", "fern");
        body.put("height_cm", 30);
        Map<String, Object> extras = new LinkedHashMap<>();
        extras.put("height_cm", 45);
        extras.put("beta_flag", true);

        assertThat(toJson(merge(body, extras))).isEqualTo("{\"name\":\"fern\",\"height_cm\":45,\"beta_flag\":true}");
    }

    @Test
    void merge_usesKeysAsGiven() throws Exception {
        assertThat(toJson(merge(Map.of(), Map.of("snake_case_Key", "value"))))
                .isEqualTo("{\"snake_case_Key\":\"value\"}");
    }

    @Test
    void merge_nullOrAbsentBody_becomesObjectOfBodyProperties() throws Exception {
        Map<String, Object> extras = Map.of("species", "monstera");
        assertThat(toJson(merge(null, extras))).isEqualTo("{\"species\":\"monstera\"}");
        assertThat(toJson(merge(Optional.empty(), extras))).isEqualTo("{\"species\":\"monstera\"}");
        assertThat(toJson(merge(Optional.of(Map.of("name", "fern")), extras)))
                .isEqualTo("{\"name\":\"fern\",\"species\":\"monstera\"}");
    }

    @Test
    void merge_serializesNestedAndNullValues() throws Exception {
        Map<String, Object> nested = new LinkedHashMap<>();
        nested.put("soil", Map.of("ph", 6.5));
        nested.put("tags", List.of("indoor", "low-light"));
        Map<String, Object> extras = new LinkedHashMap<>();
        extras.put("care", nested);
        extras.put("watered_at", null);

        assertThat(toJson(merge(Map.of("name", "fern"), extras)))
                .isEqualTo("{\"name\":\"fern\",\"care\":{\"soil\":{\"ph\":6.5},\"tags\":[\"indoor\",\"low-light\"]},"
                        + "\"watered_at\":null}");
    }

    @Test
    void merge_replacesNestedObjectWholesale() throws Exception {
        Map<String, Object> body = Map.of("care", Map.of("water", "weekly", "light", "bright"));
        assertThat(toJson(merge(body, Map.of("care", Map.of("water", "daily")))))
                .isEqualTo("{\"care\":{\"water\":\"daily\"}}");
    }

    @Test
    void merge_nonObjectBody_isReturnedUnchanged() throws Exception {
        List<String> body = Arrays.asList("fern", "moss");
        assertThat(merge(body, Map.of("extra", 1))).isSameAs(body);
        assertThat(merge("fern", Map.of("extra", 1))).isEqualTo("fern");
    }

    @Test
    void merge_serializesPojoBodies() throws Exception {
        assertThat(toTree(merge(new Plant("fern", 30), Map.of("height_cm", 45))))
                .isEqualTo(toTree("{\"name\":\"fern\",\"height_cm\":45}"));
    }

    @Test
    void toRequestBody_withoutBodyProperties_returnsFallback() throws Exception {
        okhttp3.RequestBody fallback = okhttp3.RequestBody.create("", null);
        assertThat(toRequestBody(null, fallback)).isSameAs(fallback);
        assertThat(toRequestBody(Map.of(), null)).isNull();
    }

    @Test
    void toRequestBody_withBodyProperties_sendsJsonObject() throws Exception {
        okhttp3.RequestBody requestBody = toRequestBody(Map.of("species", "monstera"), null);
        Buffer buffer = new Buffer();
        requestBody.writeTo(buffer);
        assertThat(buffer.readUtf8()).isEqualTo("{\"species\":\"monstera\"}");
        assertThat(requestBody.contentType().toString()).isEqualTo("application/json");
    }

    @Test
    void mergeFormParams_bodyPropertyOverridesFormParam() throws Exception {
        Map<String, Object> formParams = new LinkedHashMap<>();
        formParams.put("name", "fern");
        formParams.put("height_cm", 30);
        Map<String, Object> extras = new LinkedHashMap<>();
        extras.put("height_cm", 45);
        extras.put("beta_flag", "true");

        Map<String, Object> merged = mergeFormParams(formParams, extras);
        assertThat(merged).containsExactly(
                Map.entry("name", "fern"), Map.entry("height_cm", 45), Map.entry("beta_flag", "true"));
        assertThat(mergeFormParams(null, Map.of("species", "monstera")))
                .containsExactly(Map.entry("species", "monstera"));
        assertThat(mergeFormParams(formParams, null)).isEqualTo(formParams);
    }

    public static final class Plant {
        private final String name;
        private final int heightCm;

        Plant(String name, int heightCm) {
            this.name = name;
            this.heightCm = heightCm;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("name")
        public String getName() {
            return name;
        }

        @com.fasterxml.jackson.annotation.JsonProperty("height_cm")
        public int getHeightCm() {
            return heightCm;
        }
    }

    private static Object merge(Object body, Map<String, Object> bodyProperties) throws Exception {
        return invoke("merge", new Class<?>[] {Object.class, Map.class}, body, bodyProperties);
    }

    private static okhttp3.RequestBody toRequestBody(Map<String, Object> bodyProperties, okhttp3.RequestBody fallback)
            throws Exception {
        return (okhttp3.RequestBody)
                invoke("toRequestBody", new Class<?>[] {Map.class, okhttp3.RequestBody.class}, bodyProperties, fallback);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> mergeFormParams(Map<String, Object> formParams, Map<String, Object> extras)
            throws Exception {
        return (Map<String, Object>)
                invoke("mergeFormParams", new Class<?>[] {Map.class, Map.class}, formParams, extras);
    }

    private static Object invoke(String name, Class<?>[] parameterTypes, Object... args) throws Exception {
        Method method = bodyPropertiesClass.getMethod(name, parameterTypes);
        try {
            return method.invoke(null, args);
        } catch (InvocationTargetException e) {
            throw (Exception) e.getCause();
        }
    }

    private static String toJson(Object value) throws Exception {
        Object mapper = objectMappersClass.getField("JSON_MAPPER").get(null);
        return (String) mapper.getClass().getMethod("writeValueAsString", Object.class).invoke(mapper, value);
    }

    private static Object toTree(Object value) throws Exception {
        Object mapper = objectMappersClass.getField("JSON_MAPPER").get(null);
        String json = value instanceof String ? (String) value : toJson(value);
        return mapper.getClass().getMethod("readTree", String.class).invoke(mapper, json);
    }

    private static Path writeSource(Path packageDir, String fileName, String contents) throws Exception {
        Path target = packageDir.resolve(fileName);
        Files.write(target, ("package " + PACKAGE + ";\n\n" + contents).getBytes(StandardCharsets.UTF_8));
        return target;
    }

    private static String readResource(String resourcePath) throws Exception {
        try (InputStream is = BodyPropertiesTest.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IllegalStateException("Failed to find resource " + resourcePath);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
