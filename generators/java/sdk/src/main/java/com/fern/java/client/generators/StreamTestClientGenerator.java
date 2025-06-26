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

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

public final class StreamTestClientGenerator extends AbstractFileGenerator {
    private static final String TEST_CLIENT_JAVA_CLASS_NAME = "StreamTestClient";
    private static final String TEST_CLIENT_JAVA_PACKAGE = "com.seed.serversentEvents.core";

    public StreamTestClientGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(ClassName.get(TEST_CLIENT_JAVA_PACKAGE, TEST_CLIENT_JAVA_CLASS_NAME), generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec testTypeSpec = TypeSpec.classBuilder(TEST_CLIENT_JAVA_CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(generateJsonStreamTest())
                .addMethod(generateSseStreamTest())
                .addMethod(generateSseStreamWithTerminatorTest())
                .addMethod(generateStreamClosingTest())
                .addMethod(generateEmptyStreamTest())
                .addMethod(generateJsonStreamWithCustomDelimiterTest())
                .addMethod(generateMalformedJsonStreamTest())
                .addMethod(generateSseStreamWithCommentsTest())
                .addMethod(generateSseStreamWithEmptyLinesTest())
                .addMethod(generateStreamIteratorTest())
                .addMethod(generateStreamMultipleIterationTest())
                .addMethod(generateSseStreamWithoutPrefixTest())
                .build();
        JavaFile testFile =
                JavaFile.builder(TEST_CLIENT_JAVA_PACKAGE, testTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(ClassName.get(TEST_CLIENT_JAVA_PACKAGE, TEST_CLIENT_JAVA_CLASS_NAME))
                .javaFile(testFile)
                .testFile(true)
                .build();
    }

    // Helper for running stream tests
    private <T> void runStreamTest(
            String input,
            java.util.function.Function<java.io.Reader, ?> streamFactory,
            java.util.List<String> expectedKeys,
            int expectedCount) {
        java.io.Reader reader = new java.io.StringReader(input);
        Object stream = streamFactory.apply(reader);
        int count = 0;
        for (Object item : (Iterable<?>) stream) {
            count++;
            for (String key : expectedKeys) {
                assert ((java.util.Map<?, ?>) item).containsKey(key);
            }
        }
        assert count == expectedCount;
    }

    private MethodSpec generateJsonStreamTest() {
        return MethodSpec.methodBuilder("testJsonStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromJson($T.class, r), $T.asList($S), $L)",
                        "{\"message\":\"hello\"}\\n{\"message\":\"world\"}",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "message",
                        2)
                .build();
    }

    private MethodSpec generateSseStreamTest() {
        return MethodSpec.methodBuilder("testSseStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromSse($T.class, r), $T.asList($S), $L)",
                        "data: {\"event\":\"message\",\"data\":\"hello\"}\\n\\n"
                                + "data: {\"event\":\"message\",\"data\":\"world\"}\\n\\n",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "event",
                        2)
                .build();
    }

    private MethodSpec generateSseStreamWithTerminatorTest() {
        return MethodSpec.methodBuilder("testSseStreamWithTerminator")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromSse($T.class, r, $S), $T.asList($S), $L)",
                        "data: {\"message\":\"hello\"}\\n\\n" + "data: {\"message\":\"world\"}\\n\\n"
                                + "data: [DONE]\\n\\n",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        "[DONE]",
                        java.util.Arrays.class,
                        "message",
                        2)
                .build();
    }

    private MethodSpec generateStreamClosingTest() {
        return MethodSpec.methodBuilder("testStreamClosing")
                .addModifiers(Modifier.PUBLIC)
                .addException(ClassName.get("java.io", "IOException"))
                .addStatement(
                        "runStreamTest($S, r -> $T.fromJson($T.class, r), $T.asList($S), $L)",
                        "{\"test\":\"data\"}",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "test",
                        1)
                .build();
    }

    private MethodSpec generateEmptyStreamTest() {
        return MethodSpec.methodBuilder("testEmptyStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromJson($T.class, r), $T.asList(), $L)",
                        "",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        0)
                .build();
    }

    private MethodSpec generateJsonStreamWithCustomDelimiterTest() {
        return MethodSpec.methodBuilder("testJsonStreamWithCustomDelimiter")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromJson($T.class, r, $S), $T.asList($S), $L)",
                        "{\"id\":1}|{\"id\":2}|{\"id\":3}",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        "|",
                        java.util.Arrays.class,
                        "id",
                        3)
                .build();
    }

    private MethodSpec generateMalformedJsonStreamTest() {
        return MethodSpec.methodBuilder("testMalformedJsonStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromJson($T.class, r), $T.asList($S, $S), $L)",
                        "{\"valid\":true}\\n{invalid json}\\n{\"valid\":false}",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "valid",
                        "valid",
                        2)
                .build();
    }

    private MethodSpec generateSseStreamWithCommentsTest() {
        return MethodSpec.methodBuilder("testSseStreamWithComments")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromSse($T.class, r), $T.asList($S), $L)",
                        ": comment\n" + "data: {\"event\":\"start\"}\n\n"
                                + ": another comment\n"
                                + "data: {\"event\":\"end\"}\n\n",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "event",
                        2)
                .build();
    }

    private MethodSpec generateSseStreamWithEmptyLinesTest() {
        return MethodSpec.methodBuilder("testSseStreamWithEmptyLines")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromSse($T.class, r), $T.asList($S), $L)",
                        "\n\n" + "data: {\"value\":1}\n\n" + "\n\n" + "data: {\"value\":2}\n\n" + "\n\n",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "value",
                        2)
                .build();
    }

    private MethodSpec generateStreamIteratorTest() {
        return MethodSpec.methodBuilder("testStreamIterator")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromJson($T.class, r), $T.asList($S, $S), $L)",
                        "{\"a\":1}\n{\"b\":2}",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "a",
                        "b",
                        2)
                .build();
    }

    private MethodSpec generateStreamMultipleIterationTest() {
        return MethodSpec.methodBuilder("testStreamMultipleIteration")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromJson($T.class, r), $T.asList($S), $L)",
                        "{\"test\":\"data\"}",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "test",
                        1)
                .build();
    }

    private MethodSpec generateSseStreamWithoutPrefixTest() {
        return MethodSpec.methodBuilder("testSseStreamWithoutPrefix")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "runStreamTest($S, r -> $T.fromSse($T.class, r), $T.asList($S, $S), $L)",
                        "{\"direct\":\"json\"}\n\n" + "data: {\"sse\":\"format\"}\n\n",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        java.util.Arrays.class,
                        "direct",
                        "sse",
                        1)
                .build();
    }
}
