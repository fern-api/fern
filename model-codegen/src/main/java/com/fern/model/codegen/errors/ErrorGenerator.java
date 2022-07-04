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
package com.fern.model.codegen.errors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.exception.HttpException;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.TypeDefinitionGenerator;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ErrorDeclaration;
import com.fern.types.TypeDeclaration;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class ErrorGenerator extends Generator {

    private static final String STATUS_CODE_FIELD_NAME = "STATUS_CODE";
    private static final String GET_STATUS_CODE_METHOD_NAME;
    private static final String GET_ERROR_INSTANCE_ID_METHOD_NAME;

    static {
        try {
            GET_STATUS_CODE_METHOD_NAME =
                    HttpException.class.getMethod("getStatusCode").getName();
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Failed to find getStatusCode method name", e);
        }

        try {
            GET_ERROR_INSTANCE_ID_METHOD_NAME =
                    HttpException.class.getMethod("getErrorInstanceId").getName();
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Failed to find getErrorInstanceId method name", e);
        }
    }

    private static final List<String> JSON_IGNORE_EXCEPTION_PROPERTIES = List.of(
            "stackTrace",
            "cause",
            "detailMessage",
            "localizedMessage",
            "statusCode",
            "message",
            "suppressed",
            "errorInstanceId");

    private final ErrorDeclaration errorDeclaration;
    private final GeneratorContext generatorContext;
    private final Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces;

    public ErrorGenerator(
            ErrorDeclaration errorDeclaration,
            GeneratorContext generatorContext,
            Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces) {
        super(generatorContext, PackageType.ERRORS);
        this.errorDeclaration = errorDeclaration;
        this.generatorContext = generatorContext;
        this.generatedInterfaces = generatedInterfaces;
    }

    @Override
    public GeneratedError generate() {
        ClassName errorClassName =
                generatorContext.getClassNameUtils().getClassNameFromErrorName(errorDeclaration.name(), packageType);
        IGeneratedFile generatedTypeFile = errorDeclaration
                .type()
                .visit(new TypeDefinitionGenerator(
                        TypeDeclaration.builder()
                                .name(DeclaredTypeName.builder()
                                        .fernFilepath(errorDeclaration.name().fernFilepath())
                                        .name(errorClassName.simpleName())
                                        .build())
                                .shape(errorDeclaration.type())
                                .build(),
                        generatorContext,
                        generatedInterfaces,
                        PackageType.ERRORS));
        TypeSpec.Builder errorTypeSpecBuilder = getErrorTypeSpecBuilder(generatedTypeFile);
        errorTypeSpecBuilder.superclass(ClassName.get(Exception.class));
        if (errorDeclaration.http().isPresent()) {
            errorTypeSpecBuilder
                    .addSuperinterface(ClassName.get(HttpException.class))
                    .addField(FieldSpec.builder(TypeName.INT, STATUS_CODE_FIELD_NAME)
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                            .initializer("$L", errorDeclaration.http().get().statusCode())
                            .build())
                    .addMethod(MethodSpec.methodBuilder(GET_STATUS_CODE_METHOD_NAME)
                            .addModifiers(Modifier.PUBLIC)
                            .addStatement("return $L", STATUS_CODE_FIELD_NAME)
                            .returns(ClassName.INT)
                            .addAnnotation(Override.class)
                            .build())
                    .addMethod(MethodSpec.methodBuilder("errorInstanceId")
                            .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                            .addStatement("return $N()", GET_ERROR_INSTANCE_ID_METHOD_NAME)
                            .returns(ClassNameUtils.STRING_CLASS_NAME)
                            .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                    .addMember(
                                            "value",
                                            "$S",
                                            generatorContext.getFernConstants().errorInstanceIdKey())
                                    .build())
                            .build());
        }
        JavaFile errorFile = JavaFile.builder(errorClassName.packageName(), errorTypeSpecBuilder.build())
                .build();
        return GeneratedError.builder()
                .file(errorFile)
                .className(errorClassName)
                .errorDeclaration(errorDeclaration)
                .build();
    }

    private TypeSpec.Builder getErrorTypeSpecBuilder(IGeneratedFile generatedFile) {
        TypeSpec generatedTypeSpec = generatedFile.file().typeSpec;

        TypeSpec.Builder errorTypeSpecBuilder =
                TypeSpec.classBuilder(generatedFile.className()).addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC);
        generatedTypeSpec.modifiers.forEach(errorTypeSpecBuilder::addModifiers);

        List<AnnotationSpec> annotationSpecs;
        if (generatedFile instanceof GeneratedObject) {
            annotationSpecs = generatedTypeSpec.annotations.stream()
                    .map(annotationSpec -> {
                        if (annotationSpec.type.equals(ClassName.get(JsonIgnoreProperties.class))) {
                            AnnotationSpec.Builder convertedAnnotationBuilder =
                                    AnnotationSpec.builder(JsonIgnoreProperties.class);
                            annotationSpec.members.forEach((key, val) -> {
                                val.forEach(codeBlock -> {
                                    convertedAnnotationBuilder.addMember(key, codeBlock);
                                });
                            });
                            JSON_IGNORE_EXCEPTION_PROPERTIES.forEach(exceptionProperty -> {
                                convertedAnnotationBuilder.addMember("value", "$S", exceptionProperty);
                            });
                            return convertedAnnotationBuilder.build();
                        }
                        return annotationSpec;
                    })
                    .collect(Collectors.toList());
        } else {
            annotationSpecs = generatedTypeSpec.annotations;
        }

        errorTypeSpecBuilder
                .addJavadoc(generatedTypeSpec.javadoc)
                .addAnnotations(annotationSpecs)
                .addTypeVariables(generatedTypeSpec.typeVariables)
                .superclass(generatedTypeSpec.superclass)
                .addSuperinterfaces(generatedTypeSpec.superinterfaces)
                .addFields(generatedTypeSpec.fieldSpecs)
                .addMethods(generatedTypeSpec.methodSpecs)
                .addTypes(generatedTypeSpec.typeSpecs);
        return errorTypeSpecBuilder;
    }
}
