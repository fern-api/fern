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
package com.fern.model.codegen.services.payloads;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameConstants;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.MethodNameUtils;
import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.services.commons.DeclaredServiceName;
import com.fern.ir.model.services.commons.ResponseError;
import com.fern.ir.model.services.commons.ResponseErrors;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.exception.HttpException;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class FailedResponseGenerator extends Generator {

    private static final String FAILED_RESPONSE_SUFFIX = "FailedResponse";

    private static final String INTERNAL_VALUE_INTERFACE_NAME = "InternalValue";
    private static final String INTERNAL_CLASS_NAME_PREFIX = "Internal";
    private static final String INTERNAL_CLASS_NAME_SUFFIX = "Value";

    private static final String GET_INTERNAL_VALUE_METHOD_NAME = "getInternalValue";

    private static final String GET_ERROR_INSTANCE_ID_METHOD_NAME = "getErrorInstanceId";
    public static final String GET_EXCEPTION_METHOD_NAME = "getException";

    private static final String VALUE_FIELD_NAME = "value";

    private final ResponseErrors responseErrors;
    private final Map<DeclaredErrorName, GeneratedError> generatedErrors;
    private final ClassName generatedEndpointErrorClassName;
    private final Map<ResponseError, ClassName> internalValueClassNames;
    private final ClassName internalValueInterfaceClassName;

    public FailedResponseGenerator(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratorContext generatorContext,
            Map<DeclaredErrorName, GeneratedError> generatedErrors) {
        super(generatorContext);
        this.responseErrors = httpEndpoint.getErrors();
        this.generatedErrors = generatedErrors;
        this.generatedEndpointErrorClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(
                        DeclaredServiceName.builder()
                                .fernFilepath(httpService.getName().getFernFilepath())
                                .name(httpEndpoint.getId().get())
                                .build(),
                        FAILED_RESPONSE_SUFFIX,
                        PackageType.MODEL);
        this.internalValueClassNames = httpEndpoint.getErrors().get().stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        error -> generatedEndpointErrorClassName.nestedClass(
                                INTERNAL_CLASS_NAME_PREFIX + error.getError().getName() + INTERNAL_CLASS_NAME_SUFFIX)));
        this.internalValueInterfaceClassName =
                generatedEndpointErrorClassName.nestedClass(INTERNAL_VALUE_INTERFACE_NAME);
    }

    @Override
    public GeneratedEndpointError generate() {
        Map<DeclaredErrorName, MethodSpec> errorNameToMethodSpec = getStaticBuilderMethods();
        TypeSpec endpointErrorTypeSpec = TypeSpec.classBuilder(generatedEndpointErrorClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addAnnotation(Value.Enclosing.class)
                .addField(FieldSpec.builder(internalValueInterfaceClassName, VALUE_FIELD_NAME)
                        .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(getConstructor())
                .addMethod(getInternalValueMethod())
                .addMethod(getExceptionMethodSpec())
                .addMethods(errorNameToMethodSpec.values())
                .addType(getInternalValueInterface())
                .addTypes(getInternalValueTypeSpecs().values())
                .build();
        JavaFile aliasFile = JavaFile.builder(generatedEndpointErrorClassName.packageName(), endpointErrorTypeSpec)
                .build();
        return GeneratedEndpointError.builder()
                .file(aliasFile)
                .className(generatedEndpointErrorClassName)
                .putAllConstructorsByResponseError(errorNameToMethodSpec)
                .build();
    }

    private MethodSpec getConstructor() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(internalValueInterfaceClassName, VALUE_FIELD_NAME)
                .addStatement("this.$L = $L", VALUE_FIELD_NAME, VALUE_FIELD_NAME)
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L",
                                ClassName.get(JsonCreator.Mode.class),
                                JsonCreator.Mode.DELEGATING.name())
                        .build())
                .build();
    }

    private MethodSpec getInternalValueMethod() {
        return MethodSpec.methodBuilder(GET_INTERNAL_VALUE_METHOD_NAME)
                .returns(internalValueInterfaceClassName)
                .addStatement("return value")
                .addAnnotation(JsonValue.class)
                .build();
    }

    private MethodSpec getExceptionMethodSpec() {
        return MethodSpec.methodBuilder(GET_EXCEPTION_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .returns(ClassNameConstants.EXCEPTION_CLASS_NAME)
                .addStatement("return $L.$L()", VALUE_FIELD_NAME, GET_EXCEPTION_METHOD_NAME)
                .build();
    }

    private Map<DeclaredErrorName, MethodSpec> getStaticBuilderMethods() {
        return responseErrors.get().stream().collect(Collectors.toMap(ResponseError::getError, errorResponse -> {
            ErrorDeclaration errorDeclaration =
                    generatorContext.getErrorDefinitionsByName().get(errorResponse.getError());
            String methodName = MethodNameUtils.getCompatibleMethodName(
                    errorDeclaration.getDiscriminantValue().getWireValue());
            MethodSpec.Builder staticBuilder = MethodSpec.methodBuilder(methodName)
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .returns(generatedEndpointErrorClassName);
            // static builders for void types should have no parameters
            GeneratedError generatedError = generatedErrors.get(errorResponse.getError());
            return staticBuilder
                    .addParameter(generatedError.className(), "value")
                    .addStatement(
                            "return new $T($T.of(value))",
                            generatedEndpointErrorClassName,
                            internalValueClassNames.get(errorResponse))
                    .build();
        }));
    }

    /*
     * Example of an InternalValue code generation below.
     * @JsonTypeInfo(
     *         use = JsonTypeInfo.Id.NAME,
     *         include = JsonTypeInfo.As.PROPERTY,
     *         property = "_type",
     *         visible = true)
     * @JsonSubTypes({
     *         @JsonSubTypes.Type(value = On.class, name = "on"),
     *         @JsonSubTypes.Type(value = Off.class, name = "off")
     * })
     * @JsonIgnoreProperties(ignoreUnknown = true)
     * private interface InternalValue {
     *     int getStatusCode();
     *     Exception getNestedError();
     * }
     */
    private TypeSpec getInternalValueInterface() {
        TypeVariableName genericExceptionTypeVar = TypeVariableName.get("T").withBounds(HttpException.class);
        TypeSpec.Builder baseInterfaceTypeSpecBuilder = TypeSpec.interfaceBuilder(internalValueInterfaceClassName)
                .addModifiers(Modifier.PRIVATE)
                .addTypeVariable(genericExceptionTypeVar)
                .addMethod(MethodSpec.methodBuilder(GET_EXCEPTION_METHOD_NAME)
                        .addAnnotation(JsonIgnore.class)
                        .returns(genericExceptionTypeVar)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .build())
                .addMethod(MethodSpec.methodBuilder(GET_ERROR_INSTANCE_ID_METHOD_NAME)
                        .returns(String.class)
                        .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                .addMember(
                                        "value",
                                        "$S",
                                        generatorContext.getFernConstants().getErrorInstanceIdKey())
                                .build())
                        .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                        .addStatement("return $L().$L()", GET_EXCEPTION_METHOD_NAME, "getErrorInstanceId")
                        .build())
                .addAnnotation(AnnotationSpec.builder(JsonTypeInfo.class)
                        .addMember("use", "$T.$L", ClassName.get(JsonTypeInfo.Id.class), JsonTypeInfo.Id.NAME.name())
                        .addMember(
                                "include",
                                "$T.$L",
                                ClassName.get(JsonTypeInfo.As.class),
                                JsonTypeInfo.As.PROPERTY.name())
                        .addMember(
                                "property",
                                "$S",
                                generatorContext.getFernConstants().getErrorDiscriminant())
                        .addMember("visible", "true")
                        .build());
        AnnotationSpec.Builder jsonSubTypeAnnotationBuilder = AnnotationSpec.builder(JsonSubTypes.class);
        KeyedStream.stream(internalValueClassNames).forEach((singleUnionType, unionTypeClassName) -> {
            ErrorDeclaration errorDeclaration =
                    generatorContext.getErrorDefinitionsByName().get(singleUnionType.getError());
            AnnotationSpec subTypeAnnotation = AnnotationSpec.builder(JsonSubTypes.Type.class)
                    .addMember("value", "$T.class", unionTypeClassName)
                    .addMember(
                            "name",
                            "$S",
                            errorDeclaration.getDiscriminantValue().getWireValue())
                    .build();
            jsonSubTypeAnnotationBuilder.addMember("value", "$L", subTypeAnnotation);
        });
        baseInterfaceTypeSpecBuilder
                .addAnnotation(jsonSubTypeAnnotationBuilder.build())
                .addAnnotation(AnnotationSpec.builder(JsonIgnoreProperties.class)
                        .addMember("ignoreUnknown", "true")
                        .build());
        return baseInterfaceTypeSpecBuilder.build();
    }

    private Map<ResponseError, TypeSpec> getInternalValueTypeSpecs() {
        return responseErrors.get().stream().collect(Collectors.toMap(Function.identity(), responseError -> {
            ErrorDeclaration errorDeclaration =
                    generatorContext.getErrorDefinitionsByName().get(responseError.getError());
            GeneratedError generatedError = generatedErrors.get(responseError.getError());
            ClassName internalValueClassName = internalValueClassNames.get(responseError);
            TypeSpec.Builder typeSpecBuilder = TypeSpec.interfaceBuilder(internalValueClassName)
                    .addAnnotation(Value.Immutable.class)
                    .addAnnotation(AnnotationSpec.builder(JsonTypeName.class)
                            .addMember(
                                    "value",
                                    "$S",
                                    errorDeclaration.getDiscriminantValue().getWireValue())
                            .build())
                    .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                            .addMember(
                                    "as",
                                    "$T.$L.class",
                                    generatedEndpointErrorClassName,
                                    internalValueClassName.simpleName())
                            .build())
                    .addSuperinterface(
                            ParameterizedTypeName.get(internalValueInterfaceClassName, generatedError.className()));
            return typeSpecBuilder
                    .addMethod(MethodSpec.methodBuilder("body")
                            .addModifiers(Modifier.PUBLIC, Modifier.DEFAULT)
                            .returns(generatedError.generatedBodyFile().className())
                            .addAnnotation(Value.Derived.class)
                            .addAnnotation(JsonUnwrapped.class)
                            .addStatement(
                                    "return $L().$L()",
                                    GET_EXCEPTION_METHOD_NAME,
                                    ErrorGenerator.GET_ERROR_BODY_METHOD_NAME)
                            .build())
                    .addMethod(MethodSpec.methodBuilder("of")
                            .addModifiers(Modifier.STATIC, Modifier.PUBLIC)
                            .returns(internalValueClassName)
                            .addParameter(generatedError.className(), "value")
                            .addStatement(
                                    "return Immutable$L.$L.builder().$L(value).build()",
                                    generatedEndpointErrorClassName.simpleName(),
                                    internalValueClassName.simpleName(),
                                    "exception")
                            .build())
                    .build();
        }));
    }
}
