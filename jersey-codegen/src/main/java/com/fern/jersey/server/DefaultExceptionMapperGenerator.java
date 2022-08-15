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

package com.fern.jersey.server;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.Generator;
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
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import org.immutables.value.Value.Immutable;

public final class DefaultExceptionMapperGenerator extends Generator {

    private static final String DEFAULT_EXCEPTION_MAPPER = "DefaultExceptionMapper";
    private static final String DEFAULT_EXCEPTION_BODY_CLASSNAME = "DefaultExceptionBody";
    private static final String DEFAULT_EXCEPTION_BODY_CREATE_METHOD_NAME = "create";
    private static final String BODY_LOCAL_VAR_NAME = "body";
    private static final String ERROR_INSTANCE_ID_METHOD_NAME = "errorInstanceId";
    private static final String TO_RESPONSE_METHOD_NAME;
    private static final String RANDOM_UUID_METHOD_NAME;

    static {
        try {
            TO_RESPONSE_METHOD_NAME = ExceptionMapper.class
                    .getMethod("toResponse", Throwable.class)
                    .getName();
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Failed to find ExceptionMapper.toResponse method name", e);
        }

        try {
            RANDOM_UUID_METHOD_NAME = UUID.class.getMethod("randomUUID").getName();
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Failed to find UUID.randomUUID method name", e);
        }
    }

    private final ClassName defaultExceptionMapperClassName;
    private final ClassName defaultExceptionBodyClassname;

    public DefaultExceptionMapperGenerator(GeneratorContext generatorContext) {
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
                .addSuperinterface(ParameterizedTypeName.get(ExceptionMapper.class, Exception.class))
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
                .addMethod(MethodSpec.methodBuilder(TO_RESPONSE_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC)
                        .addAnnotation(Override.class)
                        .addParameter(Exception.class, "e")
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
                                "return $T.status($L).entity($L).build()", Response.class, 500, BODY_LOCAL_VAR_NAME)
                        .returns(Response.class)
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
                .addAnnotation(AnnotationSpec.builder(JsonSerialize.class)
                        .addMember("as", "$T.class", defaultExceptionBodyImmutablesClassName)
                        .build())
                .addMethod(MethodSpec.methodBuilder("errorType")
                        .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                .addMember(
                                        "value",
                                        "$S",
                                        generatorContext.getFernConstants().errorDiscriminant())
                                .build())
                        .addModifiers(Modifier.PUBLIC, Modifier.DEFAULT)
                        .addStatement(
                                "return $S", generatorContext.getFernConstants().unknownErrorDiscriminantValue())
                        .returns(String.class)
                        .build())
                .addMethod(MethodSpec.methodBuilder(ERROR_INSTANCE_ID_METHOD_NAME)
                        .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                .addMember(
                                        "value",
                                        "$S",
                                        generatorContext.getFernConstants().errorInstanceIdKey())
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
