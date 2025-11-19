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
package com.fern.java.spring.generators;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.ir.ErrorDiscriminationByPropertyStrategy;
import com.fern.ir.model.ir.ErrorDiscriminationStrategy;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.spring.GeneratedSpringException;
import com.fern.java.spring.SpringGeneratorContext;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

public final class ExceptionGenerator extends AbstractFileGenerator {
    private static final String BODY_FIELD_NAME = "body";
    private static final ParameterizedTypeName EXCEPTION_HANDLER_RETURN_TYPE =
            ParameterizedTypeName.get(ResponseEntity.class, Object.class);

    private final SpringGeneratorContext springGeneratorContext;
    private final ErrorDeclaration errorDeclaration;
    private final FieldSpec statusCodeFieldSpec;
    private final GeneratedJavaFile apiExceptionClass;
    private final ParameterSpec controllerAdviceParameter;
    private final Optional<GeneratedJavaFile> errorBodyClass;

    public ExceptionGenerator(
            SpringGeneratorContext generatorContext,
            GeneratedJavaFile apiExceptionClass,
            Optional<GeneratedJavaFile> errorBodyClass,
            ErrorDeclaration errorDeclaration) {
        super(
                generatorContext.getPoetClassNameFactory().getErrorClassName(errorDeclaration.getName()),
                generatorContext);
        this.springGeneratorContext = generatorContext;
        this.apiExceptionClass = apiExceptionClass;
        this.errorDeclaration = errorDeclaration;
        this.errorBodyClass = errorBodyClass;
        this.statusCodeFieldSpec = FieldSpec.builder(int.class, "STATUS_CODE")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .initializer("$L", errorDeclaration.getStatusCode())
                .build();
        this.controllerAdviceParameter = ParameterSpec.builder(
                        className,
                        errorDeclaration.getName().getName().getCamelCase().getSafeName())
                .build();
    }

    @Override
    public GeneratedSpringException generateFile() {
        TypeSpec.Builder errorTypeSpecBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .superclass(apiExceptionClass.getClassName())
                .addField(statusCodeFieldSpec);
        if (generatorContext.getIr().getErrorDiscriminationStrategy().isProperty()) {
            ErrorDiscriminationByPropertyStrategy errorDiscriminationByPropertyStrategy = generatorContext
                    .getIr()
                    .getErrorDiscriminationStrategy()
                    .getProperty()
                    .get();
            errorTypeSpecBuilder.addField(FieldSpec.builder(
                            String.class, getErrorNameFieldName(errorDiscriminationByPropertyStrategy))
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                    .initializer("$S", errorDeclaration.getDiscriminantValue().getWireValue())
                    .build());
        }

        Optional<TypeName> bodyTypeName = Optional.empty();
        if (errorDeclaration.getType().isPresent()) {
            TypeReference typeReference = errorDeclaration.getType().get();
            bodyTypeName = Optional.of(generatorContext.getPoetTypeNameMapper().convertToTypeName(true, typeReference));
        }

        bodyTypeName.ifPresent(typeName -> errorTypeSpecBuilder
                .addField(FieldSpec.builder(typeName, BODY_FIELD_NAME)
                        .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(typeName, BODY_FIELD_NAME)
                        .addStatement("this.$L = $L", BODY_FIELD_NAME, BODY_FIELD_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder("getBody")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(typeName)
                        .addAnnotation(JsonValue.class)
                        .addStatement("return this.$L", BODY_FIELD_NAME)
                        .build()));
        TypeSpec errorTypeSpec = errorTypeSpecBuilder.build();
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), errorTypeSpec).build();
        return GeneratedSpringException.builder()
                .className(className)
                .javaFile(javaFile)
                .controllerAdvice(getControllerAdvice())
                .build();
    }

    private GeneratedJavaFile getControllerAdvice() {
        ClassName controllerAdviceClassName = springGeneratorContext
                .getPoetClassNameFactory()
                .getErrorControllerAdviceName(errorDeclaration.getName());

        MethodSpec.Builder handlerMethod = MethodSpec.methodBuilder("handle")
                .addAnnotation(AnnotationSpec.builder(ExceptionHandler.class)
                        .addMember("value", "$T.class", className)
                        .build())
                .addParameter(controllerAdviceParameter)
                .returns(EXCEPTION_HANDLER_RETURN_TYPE);

        springGeneratorContext
                .getIr()
                .getErrorDiscriminationStrategy()
                .visit(new ControllerAdviceImplementer(handlerMethod));

        TypeSpec controllerAdviceType = TypeSpec.classBuilder(controllerAdviceClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addAnnotation(RestControllerAdvice.class)
                .addMethod(handlerMethod.build())
                .build();
        JavaFile javaFile = JavaFile.builder(controllerAdviceClassName.packageName(), controllerAdviceType)
                .build();
        return GeneratedJavaFile.builder()
                .className(controllerAdviceClassName)
                .javaFile(javaFile)
                .build();
    }

    private final class ControllerAdviceImplementer implements ErrorDiscriminationStrategy.Visitor<Void> {

        private final MethodSpec.Builder handleMethod;

        ControllerAdviceImplementer(MethodSpec.Builder handleMethod) {
            this.handleMethod = handleMethod;
        }

        @Override
        public Void visitStatusCode() {
            if (errorDeclaration.getType().isPresent()) {
                handleMethod.addStatement(
                        "return $T.status($T.$L).body($L.getBody())",
                        ResponseEntity.class,
                        className,
                        statusCodeFieldSpec.name,
                        controllerAdviceParameter.name);
            } else {
                handleMethod.addStatement(
                        "return $T.status($T.$L).build()",
                        ResponseEntity.class,
                        className,
                        statusCodeFieldSpec.name);
            }
            return null;
        }

        @Override
        public Void visitProperty(ErrorDiscriminationByPropertyStrategy property) {
            GeneratedJavaFile errorBodyFile = errorBodyClass.orElseThrow(() -> new RuntimeException(
                    "Expected a core error body file in property-based error " + "discrimination"));
            String errorNameField = getErrorNameFieldName(property);
            if (errorDeclaration.getType().isPresent()) {
                handleMethod.addStatement(
                        "$T body = new $T<>($T.$L, $L.getBody())",
                        errorBodyFile.getClassName(),
                        errorBodyFile.getClassName(),
                        className,
                        errorNameField,
                        controllerAdviceParameter.name);
                handleMethod.addStatement(
                        "return $T.status($T.$L).body(body)",
                        ResponseEntity.class,
                        className,
                        statusCodeFieldSpec.name);
            } else {
                handleMethod.addStatement(
                        "$T body = new $T<>($T.$L)",
                        errorBodyFile.getClassName(),
                        errorBodyFile.getClassName(),
                        className,
                        errorNameField);
                handleMethod.addStatement(
                        "return $T.status($T.$L).body(body)",
                        ResponseEntity.class,
                        className,
                        statusCodeFieldSpec.name);
            }
            return null;
        }

        @Override
        public Void _visitUnknown(Object unknownType) {
            return null;
        }
    }

    private static String getErrorNameFieldName(
            ErrorDiscriminationByPropertyStrategy errorDiscriminationByPropertyStrategy) {
        return errorDiscriminationByPropertyStrategy
                .getDiscriminant()
                .getName()
                .getScreamingSnakeCase()
                .getSafeName();
    }
}
