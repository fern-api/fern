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

public final class TestGenerator extends AbstractFileGenerator {

    private static final String TEST_CLIENT_JAVA_CLASS_NAME = "TestClient";

    public TestGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(
                ClassName.get(generatorContext.getPoetClassNameFactory().getRootPackage(), TEST_CLIENT_JAVA_CLASS_NAME),
                generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec testTypeSpec = TypeSpec.classBuilder(className)
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
                JavaFile.builder(className.packageName(), testTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(testFile)
                .testFile(true)
                .build();
    }

    private MethodSpec generateJsonStreamTest() {
        return MethodSpec.methodBuilder("testJsonStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T data = $S", String.class, "{\"message\":\"hello\"}\\n{\"message\":\"world\"}")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromJson($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S)", "message")
                .endControlFlow()
                .addStatement("assert count == 2")
                .build();
    }

    private MethodSpec generateSseStreamTest() {
        return MethodSpec.methodBuilder("testSseStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T data = $S",
                        String.class,
                        "data: {\"event\":\"message\",\"data\":\"hello\"}\\n\\n"
                                + "data: {\"event\":\"message\",\"data\":\"world\"}\\n\\n")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromSse($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S)", "event")
                .endControlFlow()
                .addStatement("assert count == 2")
                .build();
    }

    private MethodSpec generateSseStreamWithTerminatorTest() {
        return MethodSpec.methodBuilder("testSseStreamWithTerminator")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T data = $S",
                        String.class,
                        "data: {\"message\":\"hello\"}\\n\\n" + "data: {\"message\":\"world\"}\\n\\n"
                                + "data: [DONE]\\n\\n")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromSse($T.class, reader, $S)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        "[DONE]")
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S)", "message")
                .endControlFlow()
                .addStatement("assert count == 2")
                .build();
    }

    private MethodSpec generateStreamClosingTest() {
        return MethodSpec.methodBuilder("testStreamClosing")
                .addModifiers(Modifier.PUBLIC)
                .addException(ClassName.get("java.io", "IOException"))
                .addStatement("$T data = $S", String.class, "{\"test\":\"data\"}")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromJson($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("stream.close()")
                .addStatement("$T iterator = stream.iterator()", ClassName.get("java.util", "Iterator"))
                .addStatement("assert !iterator.hasNext()")
                .build();
    }

    private MethodSpec generateEmptyStreamTest() {
        return MethodSpec.methodBuilder("testEmptyStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T data = $S", String.class, "")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromJson($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .endControlFlow()
                .addStatement("assert count == 0")
                .build();
    }

    private MethodSpec generateJsonStreamWithCustomDelimiterTest() {
        return MethodSpec.methodBuilder("testJsonStreamWithCustomDelimiter")
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T data = $S", String.class, "{\"id\":1}|{\"id\":2}|{\"id\":3}")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromJson($T.class, reader, $S)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        "|")
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S)", "id")
                .endControlFlow()
                .addStatement("assert count == 3")
                .build();
    }

    private MethodSpec generateMalformedJsonStreamTest() {
        return MethodSpec.methodBuilder("testMalformedJsonStream")
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T data = $S", String.class, "{\"valid\":true}\\n{invalid json}\\n{\"valid\":false}")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromJson($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S) || item.containsKey($S)", "valid", "valid")
                .endControlFlow()
                .addStatement("assert count == 2")
                .build();
    }

    private MethodSpec generateSseStreamWithCommentsTest() {
        return MethodSpec.methodBuilder("testSseStreamWithComments")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T data = $S",
                        String.class,
                        ": comment\\n" +
                        "data: {\"event\":\"start\"}\\n\\n" +
                        ": another comment\\n" +
                        "data: {\"event\":\"end\"}\\n\\n")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromSse($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S)", "event")
                .endControlFlow()
                .addStatement("assert count == 2")
                .build();
    }

    private MethodSpec generateSseStreamWithEmptyLinesTest() {
        return MethodSpec.methodBuilder("testSseStreamWithEmptyLines")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T data = $S",
                        String.class,
                        "\\n\\n" +
                        "data: {\"value\":1}\\n\\n" +
                        "\\n\\n" +
                        "data: {\"value\":2}\\n\\n" +
                        "\\n\\n")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromSse($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S)", "value")
                .endControlFlow()
                .addStatement("assert count == 2")
                .build();
    }

    private MethodSpec generateStreamIteratorTest() {
        return MethodSpec.methodBuilder("testStreamIterator")
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T data = $S", String.class, "{\"a\":1}\\n{\"b\":2}")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromJson($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("$T iterator = stream.iterator()", ClassName.get("java.util", "Iterator"))
                .addStatement("assert iterator.hasNext()")
                .addStatement("$T first = ($T) iterator.next()", ClassName.get("java.util", "Map"), ClassName.get("java.util", "Map"))
                .addStatement("assert first.containsKey($S)", "a")
                .addStatement("assert iterator.hasNext()")
                .addStatement("$T second = ($T) iterator.next()", ClassName.get("java.util", "Map"), ClassName.get("java.util", "Map"))
                .addStatement("assert second.containsKey($S)", "b")
                .addStatement("assert !iterator.hasNext()")
                .build();
    }

    private MethodSpec generateStreamMultipleIterationTest() {
        return MethodSpec.methodBuilder("testStreamMultipleIteration")
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T data = $S", String.class, "{\"test\":\"data\"}")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromJson($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int firstCount = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("firstCount++")
                .endControlFlow()
                .addStatement("assert firstCount == 1")
                .addStatement("int secondCount = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("secondCount++")
                .endControlFlow()
                .addStatement("assert secondCount == 1")
                .build();
    }

    private MethodSpec generateSseStreamWithoutPrefixTest() {
        return MethodSpec.methodBuilder("testSseStreamWithoutPrefix")
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T data = $S",
                        String.class,
                        "{\"direct\":\"json\"}\\n\\n" +
                        "data: {\"sse\":\"format\"}\\n\\n")
                .addStatement(
                        "$T reader = new $T(data)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> stream = $T.fromSse($T.class, reader)",
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"),
                        generatorContext.getPoetClassNameFactory().getStreamClassName(),
                        ClassName.get("java.util", "Map"))
                .addStatement("int count = 0")
                .beginControlFlow("for ($T item : stream)", ClassName.get("java.util", "Map"))
                .addStatement("count++")
                .addStatement("assert item.containsKey($S) || item.containsKey($S)", "direct", "sse")
                .endControlFlow()
                .addStatement("assert count == 1")
                .build();
    }
}
