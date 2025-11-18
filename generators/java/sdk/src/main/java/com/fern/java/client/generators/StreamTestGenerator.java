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

public final class StreamTestGenerator extends AbstractFileGenerator {
    private static final String STREAM_TEST_CLASS_NAME = "StreamTest";

    public StreamTestGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(
                ClassName.get(generatorContext.getPoetClassNameFactory().getRootPackage(), STREAM_TEST_CLASS_NAME),
                generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName streamClassName = generatorContext.getPoetClassNameFactory().getStreamClassName();
        ClassName testAnnotation = ClassName.get("org.junit.jupiter.api", "Test");

        TypeSpec testTypeSpec = TypeSpec.classBuilder(STREAM_TEST_CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(createJsonStreamTest(streamClassName, testAnnotation))
                .addMethod(createSseStreamTest(streamClassName, testAnnotation))
                .addMethod(createSseStreamWithTerminatorTest(streamClassName, testAnnotation))
                .addMethod(createStreamResourceTest(streamClassName, testAnnotation))
                .addMethod(createMapToJsonHelperMethod())
                .addMethod(createMapToSseHelperMethod())
                .build();

        JavaFile testFile = JavaFile.builder(className.packageName(), testTypeSpec)
                .addStaticImport(ClassName.get("org.junit.jupiter.api", "Assertions"), "*")
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(testFile)
                .testFile(true)
                .build();
    }

    private MethodSpec createJsonStreamTest(ClassName streamClassName, ClassName testAnnotation) {
        return MethodSpec.methodBuilder("testJsonStream")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T<$T<$T, $T>> messages = new $T<>()",
                        ClassName.get("java.util", "List"),
                        ClassName.get("java.util", "Map"),
                        ClassName.get(String.class),
                        ClassName.get(String.class),
                        ClassName.get("java.util", "ArrayList"))
                .addStatement(
                        "messages.add($T.singletonMap($S, $S))",
                        ClassName.get("java.util", "Collections"),
                        "message",
                        "hello")
                .addStatement(
                        "messages.add($T.singletonMap($S, $S))",
                        ClassName.get("java.util", "Collections"),
                        "message",
                        "world")
                .addStatement(
                        "$T jsonStrings = messages.stream().map($T::mapToJson).collect($T.toList())",
                        ClassName.get("java.util", "List"),
                        ClassName.get(className.packageName(), STREAM_TEST_CLASS_NAME),
                        ClassName.get("java.util.stream", "Collectors"))
                .addStatement(
                        "$T input = $T.join($S, jsonStrings)",
                        ClassName.get(String.class),
                        ClassName.get(String.class),
                        "\n")
                .addStatement(
                        "$T jsonInput = new $T(input)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> jsonStream = $T.fromJson($T.class, jsonInput)",
                        streamClassName,
                        ClassName.get("java.util", "Map"),
                        streamClassName,
                        ClassName.get("java.util", "Map"))
                .addStatement("int expectedMessages = 2")
                .addStatement("int actualMessages = 0")
                .beginControlFlow("for ($T jsonObject : jsonStream)", ClassName.get("java.util", "Map"))
                .addStatement("actualMessages++")
                .addStatement("assertTrue(jsonObject.containsKey($S))", "message")
                .endControlFlow()
                .addStatement("assertEquals(expectedMessages, actualMessages)")
                .build();
    }

    private MethodSpec createSseStreamTest(ClassName streamClassName, ClassName testAnnotation) {
        return MethodSpec.methodBuilder("testSseStream")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T<$T<$T, $T>> events = new $T<>()",
                        ClassName.get("java.util", "List"),
                        ClassName.get("java.util", "Map"),
                        ClassName.get(String.class),
                        ClassName.get(String.class),
                        ClassName.get("java.util", "ArrayList"))
                .addStatement(
                        "events.add($T.singletonMap($S, $S))",
                        ClassName.get("java.util", "Collections"),
                        "event",
                        "start")
                .addStatement(
                        "events.add($T.singletonMap($S, $S))",
                        ClassName.get("java.util", "Collections"),
                        "event",
                        "end")
                .addStatement(
                        "$T sseStrings = events.stream().map($T::mapToSse).collect($T.toList())",
                        ClassName.get("java.util", "List"),
                        ClassName.get(className.packageName(), STREAM_TEST_CLASS_NAME),
                        ClassName.get("java.util.stream", "Collectors"))
                .addStatement(
                        "$T input = $T.join($S, sseStrings)",
                        ClassName.get(String.class),
                        ClassName.get(String.class),
                        "\n\n")
                .addStatement(
                        "$T sseInput = new $T(input)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> sseStream = $T.fromSse($T.class, sseInput)",
                        streamClassName,
                        ClassName.get("java.util", "Map"),
                        streamClassName,
                        ClassName.get("java.util", "Map"))
                .addStatement("int expectedEvents = 2")
                .addStatement("int actualEvents = 0")
                .beginControlFlow("for ($T eventData : sseStream)", ClassName.get("java.util", "Map"))
                .addStatement("actualEvents++")
                .addStatement("assertTrue(eventData.containsKey($S))", "event")
                .endControlFlow()
                .addStatement("assertEquals(expectedEvents, actualEvents)")
                .build();
    }

    private MethodSpec createSseStreamWithTerminatorTest(ClassName streamClassName, ClassName testAnnotation) {
        return MethodSpec.methodBuilder("testSseStreamWithTerminator")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement(
                        "$T<$T<$T, $T>> events = new $T<>()",
                        ClassName.get("java.util", "List"),
                        ClassName.get("java.util", "Map"),
                        ClassName.get(String.class),
                        ClassName.get(String.class),
                        ClassName.get("java.util", "ArrayList"))
                .addStatement(
                        "events.add($T.singletonMap($S, $S))",
                        ClassName.get("java.util", "Collections"),
                        "message",
                        "first")
                .addStatement(
                        "events.add($T.singletonMap($S, $S))",
                        ClassName.get("java.util", "Collections"),
                        "message",
                        "second")
                .addStatement(
                        "$T sseStrings = events.stream().map($T::mapToSse).collect($T.toList())",
                        ClassName.get("java.util", "List"),
                        ClassName.get(className.packageName(), STREAM_TEST_CLASS_NAME),
                        ClassName.get("java.util.stream", "Collectors"))
                .addStatement("sseStrings.add($S)", "data: [DONE]")
                .addStatement(
                        "$T input = $T.join($S, sseStrings)",
                        ClassName.get(String.class),
                        ClassName.get(String.class),
                        "\n\n")
                .addStatement(
                        "$T sseInput = new $T(input)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"))
                .addStatement(
                        "$T<$T> sseStream = $T.fromSse($T.class, sseInput, $S)",
                        streamClassName,
                        ClassName.get("java.util", "Map"),
                        streamClassName,
                        ClassName.get("java.util", "Map"),
                        "[DONE]")
                .addStatement("int expectedEvents = 2")
                .addStatement("int actualEvents = 0")
                .beginControlFlow("for ($T eventData : sseStream)", ClassName.get("java.util", "Map"))
                .addStatement("actualEvents++")
                .addStatement("assertTrue(eventData.containsKey($S))", "message")
                .endControlFlow()
                .addStatement("assertEquals(expectedEvents, actualEvents)")
                .build();
    }

    private MethodSpec createStreamResourceTest(ClassName streamClassName, ClassName testAnnotation) {
        return MethodSpec.methodBuilder("testStreamResourceManagement")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addException(ClassName.get("java.io", "IOException"))
                .addStatement(
                        "$T testInput = new $T($S)",
                        ClassName.get("java.io", "StringReader"),
                        ClassName.get("java.io", "StringReader"),
                        "{\"test\":\"data\"}")
                .addStatement(
                        "$T<$T> testStream = $T.fromJson($T.class, testInput)",
                        streamClassName,
                        ClassName.get("java.util", "Map"),
                        streamClassName,
                        ClassName.get("java.util", "Map"))
                .addStatement("testStream.close()")
                .addStatement("assertFalse(testStream.iterator().hasNext())")
                .build();
    }

    private MethodSpec createMapToJsonHelperMethod() {
        return MethodSpec.methodBuilder("mapToJson")
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC)
                .returns(String.class)
                .addParameter(ClassName.get("java.util", "Map"), "map")
                .beginControlFlow("try")
                .addStatement(
                        "return $T.JSON_MAPPER.writeValueAsString(map)",
                        generatorContext.getPoetClassNameFactory().getCoreClassName("ObjectMappers"))
                .nextControlFlow("catch (Exception e)")
                .addStatement("throw new RuntimeException(e)")
                .endControlFlow()
                .build();
    }

    private MethodSpec createMapToSseHelperMethod() {
        return MethodSpec.methodBuilder("mapToSse")
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC)
                .returns(String.class)
                .addParameter(ClassName.get("java.util", "Map"), "map")
                .addStatement("return $S + mapToJson(map)", "data: ")
                .build();
    }
}
