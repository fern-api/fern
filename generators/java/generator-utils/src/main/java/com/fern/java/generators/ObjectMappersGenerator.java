/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
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
package com.fern.java.generators;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import java.io.IOException;
import javax.lang.model.element.Modifier;

public final class ObjectMappersGenerator extends AbstractFileGenerator {

    public static final String JSON_MAPPER_STATIC_FIELD_NAME = "JSON_MAPPER";

    public static final String STRINGIFY_METHOD_NAME = "stringify";

    public ObjectMappersGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getObjectMapperClassName(), generatorContext);
    }

    @Override
    public GeneratedObjectMapper generateFile() {
        FieldSpec jsonMapperField = FieldSpec.builder(
                        ObjectMapper.class,
                        JSON_MAPPER_STATIC_FIELD_NAME,
                        Modifier.PUBLIC,
                        Modifier.STATIC,
                        Modifier.FINAL)
                .initializer(CodeBlock.builder()
                        .add("$T.builder()\n", JsonMapper.class)
                        .indent()
                        .add(".addModule(new $T())\n", Jdk8Module.class)
                        .add(".addModule(new $T())\n", JavaTimeModule.class)
                        .add(
                                ".addModule($T.$L())\n",
                                generatorContext.getPoetClassNameFactory().getDateTimeDeserializerClassName(),
                                DateTimeDeserializerGenerator.GET_MODULE_METHOD_NAME)
                        .add(".disable($T.FAIL_ON_UNKNOWN_PROPERTIES)\n", DeserializationFeature.class)
                        .add(".disable($T.WRITE_DATES_AS_TIMESTAMPS)\n", SerializationFeature.class)
                        .add(".build()")
                        .build())
                .build();
        TypeSpec enumTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(jsonMapperField)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .addMethod(getStringifyMethod())
                .addMethod(getParseErrorBodyMethod())
                .build();
        JavaFile enumFile =
                JavaFile.builder(className.packageName(), enumTypeSpec).build();
        return GeneratedObjectMapper.builder()
                .className(className)
                .javaFile(enumFile)
                .jsonMapperStaticField(jsonMapperField)
                .build();
    }

    private static MethodSpec getStringifyMethod() {
        return MethodSpec.methodBuilder(STRINGIFY_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(String.class)
                .addParameter(ParameterSpec.builder(Object.class, "o").build())
                .beginControlFlow("try")
                .addStatement(CodeBlock.builder()
                        .add(
                                "return $L.setSerializationInclusion($T.Include.ALWAYS)\n",
                                JSON_MAPPER_STATIC_FIELD_NAME,
                                JsonInclude.class)
                        .add(".writerWithDefaultPrettyPrinter()\n")
                        .add(".writeValueAsString(o)")
                        .build())
                .endControlFlow()
                .beginControlFlow("catch ($T e)", IOException.class)
                .addStatement("return o.getClass().getName() + $S + $T.toHexString(o.hashCode())", "@", Integer.class)
                .endControlFlow()
                .build();
    }

    private static MethodSpec getParseErrorBodyMethod() {
        return MethodSpec.methodBuilder("parseErrorBody")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(Object.class)
                .addParameter(ParameterSpec.builder(String.class, "responseBodyString")
                        .build())
                .beginControlFlow("try")
                .addStatement(
                        "return $L.readValue(responseBodyString, $T.class)",
                        JSON_MAPPER_STATIC_FIELD_NAME,
                        Object.class)
                .endControlFlow()
                .beginControlFlow("catch ($T ignored)", JsonProcessingException.class)
                .addStatement("return responseBodyString")
                .endControlFlow()
                .build();
    }
}
