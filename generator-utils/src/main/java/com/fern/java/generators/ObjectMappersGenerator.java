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

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

public final class ObjectMappersGenerator extends AbstractFileGenerator {

    public static final String JSON_MAPPER_STATIC_FIELD_NAME = "JSON_MAPPER";

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
                        .add(".disable($T.FAIL_ON_UNKNOWN_PROPERTIES)\n", DeserializationFeature.class)
                        .add(".build()")
                        .build())
                .build();
        TypeSpec enumTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(jsonMapperField)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .build();
        JavaFile enumFile =
                JavaFile.builder(className.packageName(), enumTypeSpec).build();
        return GeneratedObjectMapper.builder()
                .className(className)
                .javaFile(enumFile)
                .jsonMapperStaticField(jsonMapperField)
                .build();
    }
}
