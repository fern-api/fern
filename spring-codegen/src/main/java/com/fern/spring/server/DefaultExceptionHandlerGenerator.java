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

package com.fern.spring.server;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import java.util.UUID;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value.Immutable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

public final class DefaultExceptionHandlerGenerator extends Generator {

    private static final String DEFAULT_EXCEPTION_MAPPER = "DefaultExceptionMapper";
    private static final String DEFAULT_EXCEPTION_BODY_CLASSNAME = "DefaultExceptionBody";
    private static final String DEFAULT_EXCEPTION_BODY_CREATE_METHOD_NAME = "create";
    private static final String BODY_LOCAL_VAR_NAME = "body";
    private static final String ERROR_INSTANCE_ID_METHOD_NAME = "errorInstanceId";
    private static final String RANDOM_UUID_METHOD_NAME;

    static {
        try {
            RANDOM_UUID_METHOD_NAME = UUID.class.getMethod("randomUUID").getName();
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Failed to find UUID.randomUUID method name", e);
        }
    }

    private final ClassName defaultExceptionMapperClassName;
    private final ClassName defaultExceptionBodyClassname;

    public DefaultExceptionHandlerGenerator(GeneratorContext generatorContext) {
        super(generatorContext);
        this.defaultExceptionMapperClassName = generatorContext
                .getClassNameUtils()
                .getClassName(DEFAULT_EXCEPTION_MAPPER, Optional.empty(), Optional.empty(), PackageType.SERVER);
        this.defaultExceptionBodyClassname =
                defaultExceptionMapperClassName.nestedClass(DEFAULT_EXCEPTION_BODY_CLASSNAME);
    }

    @Override
    public GeneratedFile generate() {
        TypeSpec defaultResponseBodyClass = generateDefaultResponseBodyNestedClass();
        TypeSpec defaultExceptionMapperTypeSpec = TypeSpec.classBuilder(defaultExceptionMapperClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .superclass(ResponseEntityExceptionHandler.class)
                .addAnnotation(ControllerAdvice.class)
                .addField(FieldSpec.builder(
                                ClassNameConstants.LOGGER_CLASS_NAME,
                                ClassNameConstants.LOGGER_FIELD_NAME,
                                Modifier.PRIVATE,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer(
                                "$T.$L($T.class)",
                                ClassNameConstants.LOGGER_FACTORY_CLASS_NAME,
                                ClassNameConstants.GET_LOGGER_METHOD_NAME,
                                defaultExceptionMapperClassName)
                        .build())
                .addMethod(MethodSpec.methodBuilder("handleException")
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(Exception.class, "e")
                        .addAnnotation(AnnotationSpec.builder(ExceptionHandler.class)
                                .addMember("value", "$T.class", Exception.class)
                                .build())
                        .addStatement(
                                "$T $L = $T.$L()",
                                defaultExceptionBodyClassname,
                                BODY_LOCAL_VAR_NAME,
                                defaultExceptionBodyClassname,
                                DEFAULT_EXCEPTION_BODY_CREATE_METHOD_NAME)
                        .addStatement(
                                "$L.error($S, $L.$L(), e)",
                                ClassNameConstants.LOGGER_FIELD_NAME,
                                "Error handling request. ErrorInstanceId= {}",
                                BODY_LOCAL_VAR_NAME,
                                ERROR_INSTANCE_ID_METHOD_NAME)
                        .addStatement(
                                "return new ResponseEntity<>($L, $T.INTERNAL_SERVER_ERROR)",
                                BODY_LOCAL_VAR_NAME,
                                HttpStatus.class)
                        .returns(ParameterizedTypeName.get(ResponseEntity.class, Object.class))
                        .build())
                .addType(defaultResponseBodyClass)
                .build();
        JavaFile defaultExceptionMapperFile = JavaFile.builder(
                        defaultExceptionMapperClassName.packageName(), defaultExceptionMapperTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(defaultExceptionMapperFile)
                .className(defaultExceptionMapperClassName)
                .build();
    }

    private TypeSpec generateDefaultResponseBodyNestedClass() {
        ClassName defaultExceptionBodyImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(defaultExceptionBodyClassname);
        return TypeSpec.interfaceBuilder(defaultExceptionBodyClassname)
                .addAnnotation(Immutable.class)
                .addAnnotation(ClassNameConstants.ALIAS_IMMUTABLES_STYLE_CLASSNAME)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("as", "$T.class", defaultExceptionBodyImmutablesClassName)
                        .build())
                .addMethod(MethodSpec.methodBuilder("errorType")
                        .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                .addMember(
                                        "value",
                                        "$S",
                                        generatorContext.getFernConstants().getErrorDiscriminant())
                                .build())
                        .addModifiers(Modifier.PUBLIC, Modifier.DEFAULT)
                        .addStatement(
                                "return $S", generatorContext.getFernConstants().getUnknownErrorDiscriminantValue())
                        .returns(String.class)
                        .build())
                .addMethod(MethodSpec.methodBuilder(ERROR_INSTANCE_ID_METHOD_NAME)
                        .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                .addMember(
                                        "value",
                                        "$S",
                                        generatorContext.getFernConstants().getErrorInstanceIdKey())
                                .build())
                        .addModifiers(Modifier.PUBLIC, Modifier.DEFAULT)
                        .addStatement("return $T.$N().toString()", UUID.class, RANDOM_UUID_METHOD_NAME)
                        .returns(String.class)
                        .build())
                .addMethod(MethodSpec.methodBuilder(DEFAULT_EXCEPTION_BODY_CREATE_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addStatement("return $T.of()", defaultExceptionBodyImmutablesClassName)
                        .returns(defaultExceptionBodyClassname)
                        .build())
                .build();
    }
}
