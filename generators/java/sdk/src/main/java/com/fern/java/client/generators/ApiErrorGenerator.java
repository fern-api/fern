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

import static com.fern.java.utils.PoetUtils.createGetter;

import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.lang.model.element.Modifier;
import okhttp3.Response;

public final class ApiErrorGenerator extends AbstractFileGenerator {

    private static final String MESSAGE_FIELD_NAME = "message";

    private static final FieldSpec STATUS_CODE_FIELD_SPEC = FieldSpec.builder(
                    int.class, "statusCode", Modifier.PRIVATE, Modifier.FINAL)
            .addJavadoc("The error code of the response that triggered the exception.")
            .build();

    private static final FieldSpec BODY_FIELD_SPEC = FieldSpec.builder(
                    Object.class, "body", Modifier.PRIVATE, Modifier.FINAL)
            .addJavadoc("The body of the response that triggered the exception.")
            .build();

    private static final TypeName MAP_FROM_STRING_TO_LIST_OF_STRING = ParameterizedTypeName.get(
            ClassName.get(Map.class),
            ClassName.get(String.class),
            ParameterizedTypeName.get(ClassName.get(List.class), ClassName.get(String.class)));

    private static final FieldSpec HEADERS_FIELD_SPEC = FieldSpec.builder(
                    MAP_FROM_STRING_TO_LIST_OF_STRING, "headers", Modifier.PRIVATE, Modifier.FINAL)
            .build();

    private final GeneratedJavaFile generatedBaseErrorFile;

    public ApiErrorGenerator(ClientGeneratorContext generatorContext, GeneratedJavaFile generatedBaseErrorFile) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getApiErrorClassName(
                                generatorContext.getGeneratorConfig().getOrganization(),
                                generatorContext.getGeneratorConfig().getWorkspaceName(),
                                generatorContext.getCustomConfig()),
                generatorContext);
        this.generatedBaseErrorFile = generatedBaseErrorFile;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName objectMappersClassName = generatorContext.getPoetClassNameFactory().getObjectMapperClassName();
        TypeSpec apiErrorTypeSpec = TypeSpec.classBuilder(className)
                .addJavadoc("This exception type will be thrown for any non-2XX API responses.")
                .addModifiers(Modifier.PUBLIC)
                .superclass(generatedBaseErrorFile.getClassName())
                .addField(STATUS_CODE_FIELD_SPEC)
                .addField(BODY_FIELD_SPEC)
                .addField(HEADERS_FIELD_SPEC)
                .addMethod(constructorWithoutHeaders())
                .addMethod(constructorWithHeaders())
                .addMethod(createGetter(STATUS_CODE_FIELD_SPEC))
                .addMethod(createGetter(BODY_FIELD_SPEC))
                .addMethod(createGetter(HEADERS_FIELD_SPEC))
                .addMethod(createToStringMethod(objectMappersClassName))
                .build();
        JavaFile apiErrorFile =
                JavaFile.builder(className.packageName(), apiErrorTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(apiErrorFile)
                .build();
    }

    private MethodSpec constructorWithoutHeaders() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(
                        ParameterSpec.builder(String.class, MESSAGE_FIELD_NAME).build())
                .addParameter(ParameterSpec.builder(STATUS_CODE_FIELD_SPEC.type, STATUS_CODE_FIELD_SPEC.name)
                        .build())
                .addParameter(ParameterSpec.builder(BODY_FIELD_SPEC.type, BODY_FIELD_SPEC.name)
                        .build())
                .addStatement("super($L)", MESSAGE_FIELD_NAME)
                .addStatement("this.$L = $L", STATUS_CODE_FIELD_SPEC.name, STATUS_CODE_FIELD_SPEC.name)
                .addStatement("this.$L = $L", BODY_FIELD_SPEC.name, BODY_FIELD_SPEC.name)
                .addStatement("this.$L = new $T<>()", HEADERS_FIELD_SPEC.name, HashMap.class)
                .build();
    }

    private MethodSpec constructorWithHeaders() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(
                        ParameterSpec.builder(String.class, MESSAGE_FIELD_NAME).build())
                .addParameter(ParameterSpec.builder(STATUS_CODE_FIELD_SPEC.type, STATUS_CODE_FIELD_SPEC.name)
                        .build())
                .addParameter(ParameterSpec.builder(BODY_FIELD_SPEC.type, BODY_FIELD_SPEC.name)
                        .build())
                .addParameter(
                        ParameterSpec.builder(Response.class, "rawResponse").build())
                .addStatement("super($L)", MESSAGE_FIELD_NAME)
                .addStatement("this.$L = $L", STATUS_CODE_FIELD_SPEC.name, STATUS_CODE_FIELD_SPEC.name)
                .addStatement("this.$L = $L", BODY_FIELD_SPEC.name, BODY_FIELD_SPEC.name)
                .addStatement("this.$L = new $T<>()", HEADERS_FIELD_SPEC.name, HashMap.class)
                .addCode("rawResponse.headers().forEach(header -> {\n")
                .addCode("    String key = header.component1();\n")
                .addCode("    String value = header.component2();\n")
                .addCode(
                        "    this.$L.computeIfAbsent(key, _str -> new $T<>()).add(value);\n",
                        HEADERS_FIELD_SPEC.name,
                        ArrayList.class)
                .addCode("});\n")
                .build();
    }

    private MethodSpec createToStringMethod(ClassName objectMappersClassName) {
        return MethodSpec.methodBuilder("toString")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement(
                        "return $S + $S + getMessage() + $S + statusCode + $S + $T.stringify(body) + $S",
                        className.simpleName() + "{",
                        "message: ",
                        ", statusCode: ",
                        ", body: ",
                        objectMappersClassName,
                        "}")
                .build();
    }
}
