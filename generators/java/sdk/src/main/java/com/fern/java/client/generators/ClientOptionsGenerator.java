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

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.ir.PlatformHeaders;
import com.fern.ir.model.variables.VariableDeclaration;
import com.fern.ir.model.variables.VariableId;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import okhttp3.OkHttpClient;

public final class ClientOptionsGenerator extends AbstractFileGenerator {

    public static final String HEADERS_METHOD_NAME = "headers";

    private static final String CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";

    private static final String REQUEST_OPTIONS_PARAMETER_NAME = "requestOptions";

    private static final FieldSpec HEADERS_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(Map.class, String.class, String.class),
                    "headers",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();

    private static final FieldSpec HEADER_SUPPLIERS_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(
                            ClassName.get(Map.class),
                            ClassName.get(String.class),
                            ParameterizedTypeName.get(Supplier.class, String.class)),
                    "headerSuppliers",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();
    private static final FieldSpec OKHTTP_CLIENT_FIELD = FieldSpec.builder(
                    OkHttpClient.class, "httpClient", Modifier.PRIVATE, Modifier.FINAL)
            .build();

    private final ClassName builderClassName;
    private final FieldSpec environmentField;
    private final GeneratedJavaFile requestOptionsFile;
    private final ClientGeneratorContext clientGeneratorContext;

    public ClientOptionsGenerator(
            ClientGeneratorContext clientGeneratorContext,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedJavaFile requestOptionsFile) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getCoreClassName(CLIENT_OPTIONS_CLASS_NAME),
                clientGeneratorContext);
        this.builderClassName = className.nestedClass("Builder");
        this.environmentField = FieldSpec.builder(
                        generatedEnvironmentsClass.getClassName(), "environment", Modifier.PRIVATE, Modifier.FINAL)
                .addModifiers()
                .build();
        this.requestOptionsFile = requestOptionsFile;
        this.clientGeneratorContext = clientGeneratorContext;
    }

    @Override
    public GeneratedClientOptions generateFile() {
        MethodSpec environmentGetter = createGetter(environmentField);
        MethodSpec headersFromRequestOptions = headersFromRequestOptions();
        Optional<MethodSpec> headersFromIdempotentRequestOptions = headersFromIdempotentRequestOptions();
        MethodSpec httpClientGetter = createGetter(OKHTTP_CLIENT_FIELD);
        Map<VariableId, FieldSpec> variableFields = getVariableFields();
        Map<VariableId, MethodSpec> variableGetters = getVariableGetters(variableFields);
        String platformHeadersPutString = getPlatformHeadersEntries(
                        generatorContext.getIr().getSdkConfig().getPlatformHeaders(),
                        generatorContext.getGeneratorConfig())
                .entrySet()
                .stream()
                .map(val -> CodeBlock.of("put($S, $S);", val.getKey(), val.getValue())
                        .toString())
                .collect(Collectors.joining(""));
        MethodSpec.Builder contructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(ParameterSpec.builder(environmentField.type, environmentField.name)
                        .build())
                .addParameter(ParameterSpec.builder(HEADERS_FIELD.type, HEADERS_FIELD.name)
                        .build())
                .addParameter(ParameterSpec.builder(HEADER_SUPPLIERS_FIELD.type, HEADER_SUPPLIERS_FIELD.name)
                        .build())
                .addParameter(ParameterSpec.builder(OKHTTP_CLIENT_FIELD.type, OKHTTP_CLIENT_FIELD.name)
                        .build())
                .addParameters(variableFields.values().stream()
                        .map(fieldSpec -> ParameterSpec.builder(fieldSpec.type, fieldSpec.name)
                                .build())
                        .collect(Collectors.toList()))
                .addStatement("this.$L = $L", environmentField.name, environmentField.name)
                .addStatement("this.$L = new $T<>()", HEADERS_FIELD.name, HashMap.class)
                .addStatement("this.$L.putAll($L)", HEADERS_FIELD.name, HEADERS_FIELD.name)
                .addStatement(
                        "this.$L.putAll(new $T<$T,$T>() {{$L}})",
                        HEADERS_FIELD.name,
                        HashMap.class,
                        String.class,
                        String.class,
                        platformHeadersPutString)
                .addStatement("this.$L = $L", HEADER_SUPPLIERS_FIELD.name, HEADER_SUPPLIERS_FIELD.name)
                .addStatement("this.$L = $L", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name);
        variableFields
                .values()
                .forEach(fieldSpec -> contructorBuilder.addStatement("this.$N = $N", fieldSpec, fieldSpec));
        TypeSpec.Builder clientOptionsBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(environmentField)
                .addField(HEADERS_FIELD)
                .addField(HEADER_SUPPLIERS_FIELD)
                .addField(OKHTTP_CLIENT_FIELD)
                .addFields(variableFields.values())
                .addMethod(contructorBuilder.build())
                .addMethod(environmentGetter)
                .addMethod(headersFromRequestOptions);

        if (headersFromIdempotentRequestOptions.isPresent()) {
            clientOptionsBuilder.addMethod(headersFromIdempotentRequestOptions.get());
            MethodSpec httpClientWithTimeoutGetter = MethodSpec.methodBuilder("httpClientWithTimeout")
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(
                            clientGeneratorContext.getPoetClassNameFactory().getIdempotentRequestOptionsClassName(),
                            REQUEST_OPTIONS_PARAMETER_NAME)
                    .returns(OKHTTP_CLIENT_FIELD.type)
                    .beginControlFlow("if ($L == null)", REQUEST_OPTIONS_PARAMETER_NAME)
                    .addStatement("return this.$L", OKHTTP_CLIENT_FIELD.name)
                    .endControlFlow()
                    .addStatement(
                            "return this.$L.newBuilder().callTimeout($N.getTimeout().get(), $N.getTimeoutTimeUnit())"
                                    + ".connectTimeout(0, $T.SECONDS)"
                                    + ".writeTimeout(0, $T.SECONDS)"
                                    + ".readTimeout(0, $T.SECONDS).build()",
                            OKHTTP_CLIENT_FIELD.name,
                            REQUEST_OPTIONS_PARAMETER_NAME,
                            REQUEST_OPTIONS_PARAMETER_NAME,
                            TimeUnit.class,
                            TimeUnit.class,
                            TimeUnit.class)
                    .build();
            clientOptionsBuilder.addMethod(httpClientWithTimeoutGetter);
        }

        TypeName requestOptionsClassName =
                clientGeneratorContext.getPoetClassNameFactory().getRequestOptionsClassName();
        MethodSpec httpClientWithTimeoutGetter = MethodSpec.methodBuilder("httpClientWithTimeout")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(requestOptionsClassName, REQUEST_OPTIONS_PARAMETER_NAME)
                .returns(OKHTTP_CLIENT_FIELD.type)
                .beginControlFlow("if ($L == null)", REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement("return this.$L", OKHTTP_CLIENT_FIELD.name)
                .endControlFlow()
                .addStatement(
                        "return this.$L.newBuilder().callTimeout($N.getTimeout().get(), $N.getTimeoutTimeUnit())"
                                + ".connectTimeout(0, $T.SECONDS)"
                                + ".writeTimeout(0, $T.SECONDS)"
                                + ".readTimeout(0, $T.SECONDS).build()",
                        OKHTTP_CLIENT_FIELD.name,
                        REQUEST_OPTIONS_PARAMETER_NAME,
                        REQUEST_OPTIONS_PARAMETER_NAME,
                        TimeUnit.class,
                        TimeUnit.class,
                        TimeUnit.class)
                .build();

        TypeSpec clientOptions = clientOptionsBuilder
                .addMethod(httpClientGetter)
                .addMethod(httpClientWithTimeoutGetter)
                .addMethods(variableGetters.values())
                .addMethod(MethodSpec.methodBuilder("builder")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .returns(builderClassName)
                        .addStatement("return new $T()", builderClassName)
                        .build())
                .addType(createBuilder(variableFields))
                .build();
        JavaFile environmentsFile =
                JavaFile.builder(className.packageName(), clientOptions).build();

        return GeneratedClientOptions.builder()
                .className(className)
                .javaFile(environmentsFile)
                .environment(environmentGetter)
                .httpClient(httpClientGetter)
                .httpClientWithTimeout(httpClientWithTimeoutGetter)
                .builderClassName(builderClassName)
                .putAllVariableGetters(variableGetters)
                .build();
    }

    private MethodSpec headersFromRequestOptions() {
        return constructHeadersMethod()
                .addParameter(
                        clientGeneratorContext.getPoetClassNameFactory().getRequestOptionsClassName(),
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .build();
    }

    private Optional<MethodSpec> headersFromIdempotentRequestOptions() {
        if (!clientGeneratorContext.getIr().getIdempotencyHeaders().isEmpty()) {
            return Optional.of(constructHeadersMethod()
                    .addParameter(
                            clientGeneratorContext.getPoetClassNameFactory().getIdempotentRequestOptionsClassName(),
                            REQUEST_OPTIONS_PARAMETER_NAME)
                    .build());
        }
        return Optional.empty();
    }

    private MethodSpec.Builder constructHeadersMethod() {
        return MethodSpec.methodBuilder(HEADERS_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .returns(HEADERS_FIELD.type)
                .addStatement("$T values = new $T<>(this.$L)", HEADERS_FIELD.type, HashMap.class, HEADERS_FIELD.name)
                .beginControlFlow("$L.forEach((key, supplier) -> ", HEADER_SUPPLIERS_FIELD.name)
                .addStatement("values.put(key, supplier.get())")
                .endControlFlow(")")
                .beginControlFlow("if ($L != null)", REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement("values.putAll($L.getHeaders())", REQUEST_OPTIONS_PARAMETER_NAME)
                .endControlFlow()
                .addStatement("return values");
    }

    private TypeSpec createBuilder(Map<VariableId, FieldSpec> variableFields) {
        return TypeSpec.classBuilder(builderClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addField(FieldSpec.builder(environmentField.type, environmentField.name)
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .addField(HEADERS_FIELD.toBuilder()
                        .initializer("new $T<>()", HashMap.class)
                        .build())
                .addField(HEADER_SUPPLIERS_FIELD.toBuilder()
                        .initializer("new $T<>()", HashMap.class)
                        .build())
                .addFields(variableFields.values())
                .addMethod(getEnvironmentBuilder())
                .addMethod(getHeaderBuilder())
                .addMethod(getHeaderSupplierBuilder())
                .addMethods(getVariableBuilders(variableFields))
                .addMethod(getBuildMethod(variableFields))
                .build();
    }

    private MethodSpec getEnvironmentBuilder() {
        return MethodSpec.methodBuilder(environmentField.name)
                .addModifiers(Modifier.PUBLIC)
                .returns(builderClassName)
                .addParameter(environmentField.type, environmentField.name)
                .addStatement("this.$L = $L", environmentField.name, environmentField.name)
                .addStatement("return this")
                .build();
    }

    private MethodSpec getHeaderBuilder() {
        return MethodSpec.methodBuilder("addHeader")
                .addModifiers(Modifier.PUBLIC)
                .returns(builderClassName)
                .addParameter(String.class, "key")
                .addParameter(String.class, "value")
                .addStatement("this.$L.put($L, $L)", HEADERS_FIELD.name, "key", "value")
                .addStatement("return this")
                .build();
    }

    private MethodSpec getHeaderSupplierBuilder() {
        return MethodSpec.methodBuilder("addHeader")
                .addModifiers(Modifier.PUBLIC)
                .returns(builderClassName)
                .addParameter(String.class, "key")
                .addParameter(ParameterizedTypeName.get(Supplier.class, String.class), "value")
                .addStatement("this.$L.put($L, $L)", HEADER_SUPPLIERS_FIELD.name, "key", "value")
                .addStatement("return this")
                .build();
    }

    private Map<VariableId, FieldSpec> getVariableFields() {
        return generatorContext.getIr().getVariables().stream()
                .collect(Collectors.toMap(VariableDeclaration::getId, variableDeclaration -> FieldSpec.builder(
                                generatorContext
                                        .getPoetTypeNameMapper()
                                        .convertToTypeName(true, variableDeclaration.getType()),
                                variableDeclaration.getName().getCamelCase().getSafeName(),
                                Modifier.PRIVATE)
                        .build()));
    }

    private List<MethodSpec> getVariableBuilders(Map<VariableId, FieldSpec> variableFields) {
        return generatorContext.getIr().getVariables().stream()
                .map(variableDeclaration -> {
                    FieldSpec variableField = variableFields.get(variableDeclaration.getId());
                    String variableParameterName =
                            variableDeclaration.getName().getCamelCase().getSafeName();
                    return MethodSpec.methodBuilder(
                                    variableDeclaration.getName().getCamelCase().getSafeName())
                            .addModifiers(Modifier.PUBLIC)
                            .returns(builderClassName)
                            .addParameter(
                                    generatorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, variableDeclaration.getType()),
                                    variableParameterName)
                            .addStatement("this.$N = $L", variableField, variableParameterName)
                            .addStatement("return this", variableField)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private Map<VariableId, MethodSpec> getVariableGetters(Map<VariableId, FieldSpec> variableFields) {
        return generatorContext.getIr().getVariables().stream()
                .collect(Collectors.toMap(VariableDeclaration::getId, variableDeclaration -> {
                    FieldSpec variableField = variableFields.get(variableDeclaration.getId());
                    TypeName variableTypeName = generatorContext
                            .getPoetTypeNameMapper()
                            .convertToTypeName(true, variableDeclaration.getType());
                    return MethodSpec.methodBuilder(
                                    variableDeclaration.getName().getCamelCase().getSafeName())
                            .addModifiers(Modifier.PUBLIC)
                            .returns(variableTypeName)
                            .addStatement("return this.$N", variableField)
                            .build();
                }));
    }

    private MethodSpec getBuildMethod(Map<VariableId, FieldSpec> variableFields) {
        if (variableFields.isEmpty()) {
            return MethodSpec.methodBuilder("build")
                    .addModifiers(Modifier.PUBLIC)
                    .returns(className)
                    .addStatement(CodeBlock.builder()
                            .add("$T okhttpClient = new $T.Builder()", OkHttpClient.class, OkHttpClient.class)
                            .add(
                                    "\n    .addInterceptor(new $T(3))",
                                    clientGeneratorContext
                                            .getPoetClassNameFactory()
                                            .getRetryInterceptorClassName())
                            .add("\n    .build()")
                            .build())
                    .addStatement(
                            "return new $T($L, $L, $L, $L)",
                            className,
                            environmentField.name,
                            HEADERS_FIELD.name,
                            HEADER_SUPPLIERS_FIELD.name,
                            "okhttpClient")
                    .build();
        } else {
            String variableArgs = variableFields.values().stream()
                    .map(variableField -> "this." + variableField.name)
                    .collect(Collectors.joining(","));
            return MethodSpec.methodBuilder("build")
                    .addModifiers(Modifier.PUBLIC)
                    .returns(className)
                    .addStatement(CodeBlock.builder()
                            .add("$T okhttpClient = new $T.Builder()", OkHttpClient.class, OkHttpClient.class)
                            .add(
                                    "\n    .addInterceptor(new $T(3))",
                                    clientGeneratorContext
                                            .getPoetClassNameFactory()
                                            .getRetryInterceptorClassName())
                            .add("\n    .build()")
                            .build())
                    .addStatement(
                            "return new $T($L, $L, $L, $L," + variableArgs + ")",
                            className,
                            environmentField.name,
                            HEADERS_FIELD.name,
                            HEADER_SUPPLIERS_FIELD.name,
                            "okhttpClient")
                    .build();
        }
    }

    private static MethodSpec createGetter(FieldSpec fieldSpec) {
        return MethodSpec.methodBuilder(fieldSpec.name)
                .addModifiers(Modifier.PUBLIC)
                .returns(fieldSpec.type)
                .addStatement("return this.$L", fieldSpec.name)
                .build();
    }

    private static Map<String, String> getPlatformHeadersEntries(
            PlatformHeaders platformHeaders, GeneratorConfig generatorConfig) {
        Map<String, String> entries = new HashMap<>();
        if (generatorConfig.getPublish().isPresent()) {
            entries.put(
                    platformHeaders.getSdkName(),
                    generatorConfig
                            .getPublish()
                            .get()
                            .getRegistriesV2()
                            .getMaven()
                            .getCoordinate());
            entries.put(
                    platformHeaders.getSdkVersion(),
                    generatorConfig.getPublish().get().getVersion());
        }
        entries.put(platformHeaders.getLanguage(), "JAVA");
        return entries;
    }
}
