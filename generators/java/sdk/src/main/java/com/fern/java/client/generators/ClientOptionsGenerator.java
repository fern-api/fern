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
import com.fern.ir.model.ir.ApiVersionScheme;
import com.fern.ir.model.ir.HeaderApiVersionScheme;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.ir.PlatformHeaders;
import com.fern.ir.model.publish.Filesystem;
import com.fern.ir.model.publish.GithubPublish;
import com.fern.ir.model.publish.MavenPublishTarget;
import com.fern.ir.model.publish.PublishingConfig;
import com.fern.ir.model.types.EnumValue;
import com.fern.ir.model.variables.VariableDeclaration;
import com.fern.ir.model.variables.VariableId;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.google.common.collect.ImmutableList;
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

    private static final FieldSpec TIMEOUT_FIELD = FieldSpec.builder(
                    TypeName.INT, "timeout", Modifier.PRIVATE, Modifier.FINAL)
            .build();

    private static final FieldSpec MAX_RETRIES_FIELD = FieldSpec.builder(
                    TypeName.INT, "maxRetries", Modifier.PRIVATE, Modifier.FINAL)
            .build();

    private static MethodSpec createGetter(FieldSpec fieldSpec) {
        return MethodSpec.methodBuilder(fieldSpec.name)
                .addModifiers(Modifier.PUBLIC)
                .returns(fieldSpec.type)
                .addStatement("return this.$L", fieldSpec.name)
                .build();
    }

    private static Optional<MavenPublishTarget> extractMavenTarget(PublishingConfig publishConfig) {
        // Try github.target
        if (publishConfig.getGithub().isPresent()) {
            GithubPublish github = publishConfig.getGithub().get();
            if (github.getTarget().getMaven().isPresent()) {
                return github.getTarget().getMaven();
            }
        }

        // Try direct.target
        if (publishConfig.getDirect().isPresent()) {
            com.fern.ir.model.publish.DirectPublish direct =
                    publishConfig.getDirect().get();
            if (direct.getTarget().getMaven().isPresent()) {
                return direct.getTarget().getMaven();
            }
        }

        // Try filesystem.publishTarget
        if (publishConfig.getFilesystem().isPresent()) {
            Filesystem filesystem = publishConfig.getFilesystem().get();
            if (filesystem.getPublishTarget().isPresent()
                    && filesystem.getPublishTarget().get().getMaven().isPresent()) {
                return filesystem.getPublishTarget().get().getMaven();
            }
        }

        return Optional.empty();
    }

    private static Map<String, String> getPlatformHeadersEntries(
            PlatformHeaders platformHeaders, GeneratorConfig generatorConfig, IntermediateRepresentation ir) {
        Map<String, String> entries = new HashMap<>();

        // Try generatorConfig.publish first (remote generation)
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
        // Fallback to IR publishConfig (local generation)
        else if (ir.getPublishConfig().isPresent()) {
            Optional<MavenPublishTarget> mavenTarget =
                    extractMavenTarget(ir.getPublishConfig().get());
            if (mavenTarget.isPresent()) {
                mavenTarget.get().getCoordinate().ifPresent(coord -> entries.put(platformHeaders.getSdkName(), coord));
                mavenTarget
                        .get()
                        .getVersion()
                        .ifPresent(version -> entries.put(platformHeaders.getSdkVersion(), version));
            }
        }

        if (platformHeaders.getUserAgent().isPresent()) {
            entries.put(
                    platformHeaders.getUserAgent().get().getHeader(),
                    platformHeaders.getUserAgent().get().getValue());
        }
        entries.put(platformHeaders.getLanguage(), "JAVA");
        return entries;
    }

    private final ClassName builderClassName;
    private final FieldSpec environmentField;
    private final GeneratedJavaFile requestOptionsFile;

    private final ClientGeneratorContext clientGeneratorContext;

    private final FieldSpec apiVersionField;
    private final FieldSpec webSocketFactoryField;

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
        this.apiVersionField = FieldSpec.builder(
                        clientGeneratorContext.getPoetClassNameFactory().getApiVersionClassName(),
                        "version",
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build();
        // Only create WebSocketFactory field if WebSocket channels are present
        if (clientGeneratorContext.getIr().getWebsocketChannels().isPresent()
                && !clientGeneratorContext.getIr().getWebsocketChannels().get().isEmpty()) {
            this.webSocketFactoryField = FieldSpec.builder(
                            ParameterizedTypeName.get(
                                    ClassName.get(Optional.class),
                                    clientGeneratorContext
                                            .getPoetClassNameFactory()
                                            .getCoreClassName("WebSocketFactory")),
                            "webSocketFactory",
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build();
        } else {
            this.webSocketFactoryField = null;
        }
    }

    @Override
    public GeneratedClientOptions generateFile() {
        MethodSpec environmentGetter = createGetter(environmentField);
        MethodSpec headersFromRequestOptions = headersFromRequestOptions();
        Optional<MethodSpec> headersFromIdempotentRequestOptions = headersFromIdempotentRequestOptions();
        MethodSpec httpClientGetter = createGetter(OKHTTP_CLIENT_FIELD);
        Map<VariableId, FieldSpec> variableFields = getVariableFields();
        Map<VariableId, MethodSpec> variableGetters = getVariableGetters(variableFields);
        // Create separate field specs for main class (with final) and builder (without final)
        Map<String, FieldSpec> apiPathParamFieldsForMainClass = getApiPathParamFieldsForMainClass();
        Map<String, FieldSpec> apiPathParamFieldsForBuilder = getApiPathParamFieldsForBuilder();
        Map<String, MethodSpec> apiPathParamGetters = getApiPathParamGetters(apiPathParamFieldsForMainClass);

        String platformHeadersPutString = getPlatformHeadersEntries(
                        generatorContext.getIr().getSdkConfig().getPlatformHeaders(),
                        generatorContext.getGeneratorConfig(),
                        generatorContext.getIr())
                .entrySet()
                .stream()
                .map(val -> CodeBlock.of("put($S, $S);", val.getKey(), val.getValue())
                        .toString())
                .collect(Collectors.joining(""));

        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(ParameterSpec.builder(environmentField.type, environmentField.name)
                        .build())
                .addParameter(ParameterSpec.builder(HEADERS_FIELD.type, HEADERS_FIELD.name)
                        .build())
                .addParameter(ParameterSpec.builder(HEADER_SUPPLIERS_FIELD.type, HEADER_SUPPLIERS_FIELD.name)
                        .build())
                .addParameter(ParameterSpec.builder(OKHTTP_CLIENT_FIELD.type, OKHTTP_CLIENT_FIELD.name)
                        .build())
                .addParameter(ParameterSpec.builder(TIMEOUT_FIELD.type, TIMEOUT_FIELD.name)
                        .build())
                .addParameter(ParameterSpec.builder(MAX_RETRIES_FIELD.type, MAX_RETRIES_FIELD.name)
                        .build());

        // Only add webSocketFactory parameter if WebSocket channels are present
        if (webSocketFactoryField != null) {
            constructorBuilder.addParameter(
                    ParameterSpec.builder(webSocketFactoryField.type, webSocketFactoryField.name)
                            .build());
        }

        constructorBuilder
                .addParameters(variableFields.values().stream()
                        .map(fieldSpec -> ParameterSpec.builder(fieldSpec.type, fieldSpec.name)
                                .build())
                        .collect(Collectors.toList()))
                .addParameters(apiPathParamFieldsForMainClass.values().stream()
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
                .addStatement("this.$L = $L", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name)
                .addStatement("this.$L = $L", TIMEOUT_FIELD.name, TIMEOUT_FIELD.name)
                .addStatement("this.$L = $L", MAX_RETRIES_FIELD.name, MAX_RETRIES_FIELD.name);

        // Only add webSocketFactory assignment if WebSocket channels are present
        if (webSocketFactoryField != null) {
            constructorBuilder.addStatement("this.$L = $L", webSocketFactoryField.name, webSocketFactoryField.name);
        }

        addApiVersionToConstructor(constructorBuilder);

        variableFields
                .values()
                .forEach(fieldSpec -> constructorBuilder.addStatement("this.$N = $N", fieldSpec, fieldSpec));

        apiPathParamFieldsForMainClass
                .values()
                .forEach(fieldSpec -> constructorBuilder.addStatement("this.$N = $N", fieldSpec, fieldSpec));

        TypeSpec.Builder clientOptionsBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(environmentField)
                .addField(HEADERS_FIELD)
                .addField(HEADER_SUPPLIERS_FIELD)
                .addField(OKHTTP_CLIENT_FIELD)
                .addField(TIMEOUT_FIELD)
                .addField(MAX_RETRIES_FIELD);

        // Only add webSocketFactory field if WebSocket channels are present
        if (webSocketFactoryField != null) {
            clientOptionsBuilder.addField(webSocketFactoryField);
        }

        clientOptionsBuilder
                .addFields(variableFields.values())
                .addFields(apiPathParamFieldsForMainClass.values())
                .addMethod(constructorBuilder.build())
                .addMethod(environmentGetter)
                .addMethod(headersFromRequestOptions);

        addApiVersionField(clientOptionsBuilder);

        MethodSpec timeoutGetter = MethodSpec.methodBuilder(TIMEOUT_FIELD.name)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(
                        clientGeneratorContext.getPoetClassNameFactory().getRequestOptionsClassName(),
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .returns(TIMEOUT_FIELD.type)
                .beginControlFlow("if ($L == null)", REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement("return this.$L", TIMEOUT_FIELD.name)
                .endControlFlow()
                .addStatement(
                        "return $N.getTimeout().orElse(this.$N)", REQUEST_OPTIONS_PARAMETER_NAME, TIMEOUT_FIELD.name)
                .build();

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

        MethodSpec maxRetriesGetter = createGetter(MAX_RETRIES_FIELD);

        clientOptionsBuilder
                .addMethod(timeoutGetter)
                .addMethod(httpClientGetter)
                .addMethod(httpClientWithTimeoutGetter)
                .addMethod(maxRetriesGetter);

        // Only add webSocketFactory getter if WebSocket channels are present
        if (webSocketFactoryField != null) {
            MethodSpec webSocketFactoryGetter = createGetter(webSocketFactoryField);
            clientOptionsBuilder.addMethod(webSocketFactoryGetter);
        }

        TypeSpec clientOptions = clientOptionsBuilder
                .addMethods(variableGetters.values())
                .addMethods(apiPathParamGetters.values())
                .addMethod(MethodSpec.methodBuilder("builder")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .returns(builderClassName)
                        .addStatement("return new $T()", builderClassName)
                        .build())
                .addType(createBuilder(variableFields, apiPathParamFieldsForBuilder))
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
                .putAllApiPathParamGetters(apiPathParamGetters)
                .build();
    }

    private void addApiVersionField(TypeSpec.Builder clientOptionsBuilder) {
        if (clientGeneratorContext.getIr().getApiVersion().isPresent()) {
            ApiVersionScheme apiVersionScheme =
                    clientGeneratorContext.getIr().getApiVersion().get();

            apiVersionScheme.visit(new ApiVersionScheme.Visitor<Void>() {
                @Override
                public Void visitHeader(HeaderApiVersionScheme headerApiVersionScheme) {
                    clientOptionsBuilder.addField(apiVersionField.toBuilder()
                            .addJavadoc(
                                    "$L.toString() is sent as the $S header.",
                                    apiVersionField.name,
                                    headerApiVersionScheme.getHeader().getName().getWireValue())
                            .build());
                    clientOptionsBuilder.addMethod(createGetter(apiVersionField).toBuilder()
                            .addJavadoc(
                                    "$L.toString() is sent as the $S header.",
                                    apiVersionField.name,
                                    headerApiVersionScheme.getHeader().getName().getWireValue())
                            .build());

                    return null;
                }

                @Override
                public Void _visitUnknown(Object _o) {
                    throw new IllegalArgumentException("Received unknown API versioning schema type in IR.");
                }
            });
        }
    }

    private void addApiVersionToConstructor(MethodSpec.Builder constructorBuilder) {
        if (clientGeneratorContext.getIr().getApiVersion().isPresent()) {
            ApiVersionScheme apiVersionScheme =
                    clientGeneratorContext.getIr().getApiVersion().get();

            apiVersionScheme.visit(new ApiVersionScheme.Visitor<Void>() {
                @Override
                public Void visitHeader(HeaderApiVersionScheme headerApiVersionScheme) {
                    if (headerApiVersionScheme.getValue().getDefault().isPresent()) {
                        EnumValue configuredDefaultVersion =
                                headerApiVersionScheme.getValue().getDefault().get();

                        constructorBuilder.addParameter(ParameterSpec.builder(
                                        ParameterizedTypeName.get(
                                                ClassName.get(Optional.class),
                                                clientGeneratorContext
                                                        .getPoetClassNameFactory()
                                                        .getApiVersionClassName()),
                                        apiVersionField.name)
                                .addJavadoc(
                                        "Defaults to $S if empty",
                                        configuredDefaultVersion.getName().getWireValue())
                                .build());

                        String configuredDefaultVersionString = configuredDefaultVersion
                                .getName()
                                .getName()
                                .getScreamingSnakeCase()
                                .getSafeName();

                        constructorBuilder.addStatement(
                                "this.$L = $L.orElse($L)",
                                apiVersionField.name,
                                apiVersionField.name,
                                CodeBlock.of(
                                        "$T.$L",
                                        clientGeneratorContext
                                                .getPoetClassNameFactory()
                                                .getApiVersionClassName(),
                                        configuredDefaultVersionString));
                    } else {
                        constructorBuilder.addParameter(ParameterSpec.builder(
                                        clientGeneratorContext
                                                .getPoetClassNameFactory()
                                                .getApiVersionClassName(),
                                        apiVersionField.name)
                                .build());
                        constructorBuilder.addStatement("this.$L = $L", apiVersionField.name, apiVersionField.name);
                    }

                    constructorBuilder.addStatement(
                            "this.$L.put($S,$L)",
                            HEADERS_FIELD.name,
                            headerApiVersionScheme.getHeader().getName().getWireValue(),
                            CodeBlock.of("this.$L.toString()", apiVersionField.name));

                    return null;
                }

                @Override
                public Void _visitUnknown(Object _o) {
                    throw new IllegalArgumentException("Received unknown API versioning schema type in IR.");
                }
            });
        }
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

    private TypeSpec createBuilder(
            Map<VariableId, FieldSpec> variableFields, Map<String, FieldSpec> apiPathParamFields) {
        TypeSpec.Builder builder = TypeSpec.classBuilder(builderClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addField(FieldSpec.builder(environmentField.type, environmentField.name)
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .addField(HEADERS_FIELD.toBuilder()
                        .initializer("new $T<>()", HashMap.class)
                        .build())
                .addField(HEADER_SUPPLIERS_FIELD.toBuilder()
                        .initializer("new $T<>()", HashMap.class)
                        .build())
                .addField(FieldSpec.builder(TypeName.INT, MAX_RETRIES_FIELD.name, Modifier.PRIVATE)
                        .initializer("2")
                        .build())
                .addField(FieldSpec.builder(
                                ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                                TIMEOUT_FIELD.name,
                                Modifier.PRIVATE)
                        .initializer("$T.empty()", Optional.class)
                        .build())
                .addField(FieldSpec.builder(OkHttpClient.class, OKHTTP_CLIENT_FIELD.name, Modifier.PRIVATE)
                        .initializer(CodeBlock.builder().add("null").build())
                        .build());

        // Only add webSocketFactory field to builder if WebSocket channels are present
        if (webSocketFactoryField != null) {
            builder.addField(FieldSpec.builder(webSocketFactoryField.type, webSocketFactoryField.name, Modifier.PRIVATE)
                    .initializer("$T.empty()", Optional.class)
                    .build());
        }

        builder.addFields(variableFields.values())
                .addFields(apiPathParamFields.values())
                .addMethod(getEnvironmentBuilder())
                .addMethod(getHeaderBuilder())
                .addMethod(getHeaderSupplierBuilder())
                .addMethod(MethodSpec.methodBuilder(TIMEOUT_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .addJavadoc("Override the timeout in seconds. Defaults to 60 seconds.")
                        .returns(builderClassName)
                        .addParameter(TypeName.INT, TIMEOUT_FIELD.name)
                        .addStatement("this.$L = $T.of($L)", TIMEOUT_FIELD.name, Optional.class, TIMEOUT_FIELD.name)
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder(TIMEOUT_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .addJavadoc("Override the timeout in seconds. Defaults to 60 seconds.")
                        .returns(builderClassName)
                        .addParameter(
                                ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                                TIMEOUT_FIELD.name)
                        .addStatement("this.$L = $L", TIMEOUT_FIELD.name, TIMEOUT_FIELD.name)
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder(MAX_RETRIES_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .addJavadoc("Override the maximum number of retries. Defaults to 2 retries.")
                        .returns(builderClassName)
                        .addParameter(TypeName.INT, MAX_RETRIES_FIELD.name)
                        .addStatement("this.$L = $L", MAX_RETRIES_FIELD.name, MAX_RETRIES_FIELD.name)
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder(OKHTTP_CLIENT_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .returns(builderClassName)
                        .addParameter(OkHttpClient.class, OKHTTP_CLIENT_FIELD.name)
                        .addStatement("this.$L = $L", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name)
                        .addStatement("return this")
                        .build());

        // Only add webSocketFactory method to builder if WebSocket channels are present
        if (webSocketFactoryField != null) {
            builder.addMethod(MethodSpec.methodBuilder(webSocketFactoryField.name)
                    .addModifiers(Modifier.PUBLIC)
                    .addJavadoc("Set a custom WebSocketFactory for creating WebSocket connections.\n")
                    .returns(builderClassName)
                    .addParameter(
                            clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("WebSocketFactory"),
                            webSocketFactoryField.name)
                    .addStatement(
                            "this.$L = $T.of($L)",
                            webSocketFactoryField.name,
                            Optional.class,
                            webSocketFactoryField.name)
                    .addStatement("return this")
                    .build());
        }

        builder.addMethods(getVariableBuilders(variableFields)).addMethods(getApiPathParamBuilders(apiPathParamFields));

        addApiVersionToBuilder(builder);

        builder.addMethod(getBuildMethod(variableFields, apiPathParamFields));

        Map<VariableId, MethodSpec> variableGetters = variableFields.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> MethodSpec.methodBuilder(entry.getValue().name)
                        .addModifiers(Modifier.PUBLIC)
                        .returns(entry.getValue().type)
                        .addStatement("return this.$L", entry.getValue().name)
                        .build()));
        builder.addMethod(getFromMethod(variableFields, variableGetters));

        return builder.build();
    }

    private void addApiVersionToBuilder(TypeSpec.Builder builder) {
        if (clientGeneratorContext.getIr().getApiVersion().isPresent()) {
            ApiVersionScheme apiVersionScheme =
                    clientGeneratorContext.getIr().getApiVersion().get();

            apiVersionScheme.visit(new ApiVersionScheme.Visitor<Void>() {
                @Override
                public Void visitHeader(HeaderApiVersionScheme headerApiVersionScheme) {
                    if (headerApiVersionScheme.getValue().getDefault().isPresent()) {
                        builder.addField(FieldSpec.builder(
                                        ParameterizedTypeName.get(
                                                ClassName.get(Optional.class),
                                                clientGeneratorContext
                                                        .getPoetClassNameFactory()
                                                        .getApiVersionClassName()),
                                        apiVersionField.name,
                                        Modifier.PRIVATE)
                                .initializer(CodeBlock.of("$T.empty()", Optional.class))
                                .build());
                        builder.addMethod(getOptionalVersionBuilder(
                                headerApiVersionScheme.getHeader().getName().getWireValue()));
                    } else {
                        builder.addField(FieldSpec.builder(
                                        clientGeneratorContext
                                                .getPoetClassNameFactory()
                                                .getApiVersionClassName(),
                                        apiVersionField.name,
                                        Modifier.PRIVATE)
                                .build());
                        builder.addMethod(getRequiredVersionBuilder(
                                headerApiVersionScheme.getHeader().getName().getWireValue()));
                    }

                    return null;
                }

                @Override
                public Void _visitUnknown(Object _o) {
                    throw new IllegalArgumentException("Received unknown API versioning schema type in IR.");
                }
            });
        }
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

    private MethodSpec getOptionalVersionBuilder(String headerName) {
        return MethodSpec.methodBuilder(apiVersionField.name)
                .addJavadoc("$L.toString() is sent as the $S header.", apiVersionField.name, headerName)
                .addModifiers(Modifier.PUBLIC)
                .returns(builderClassName)
                .addParameter(
                        clientGeneratorContext.getPoetClassNameFactory().getApiVersionClassName(), apiVersionField.name)
                .addStatement("this.$L = $T.ofNullable($L)", apiVersionField.name, Optional.class, apiVersionField.name)
                .addStatement("return this")
                .build();
    }

    private MethodSpec getRequiredVersionBuilder(String headerName) {
        return MethodSpec.methodBuilder(apiVersionField.name)
                .addJavadoc("$L.toString() is sent as the $S header.", apiVersionField.name, headerName)
                .addModifiers(Modifier.PUBLIC)
                .returns(builderClassName)
                .addParameter(
                        clientGeneratorContext.getPoetClassNameFactory().getApiVersionClassName(), apiVersionField.name)
                .addStatement("this.$L = $L", apiVersionField.name, apiVersionField.name)
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
                            .addStatement("return this")
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

    /**
     * Creates field specs for API-level path parameters in the main ClientOptions class. These fields MUST be final for
     * thread safety and immutability.
     */
    private Map<String, FieldSpec> getApiPathParamFieldsForMainClass() {
        return generatorContext.getIr().getPathParameters().stream()
                .collect(Collectors.toMap(
                        pathParameter -> pathParameter.getName().getOriginalName(), pathParameter -> FieldSpec.builder(
                                        generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(true, pathParameter.getValueType()),
                                        pathParameter.getName().getCamelCase().getSafeName(),
                                        Modifier.PRIVATE,
                                        Modifier.FINAL)
                                .build()));
    }

    /**
     * Creates field specs for API-level path parameters in the Builder class. These fields MUST NOT be final so they
     * can be set via setter methods.
     */
    private Map<String, FieldSpec> getApiPathParamFieldsForBuilder() {
        return generatorContext.getIr().getPathParameters().stream()
                .collect(Collectors.toMap(
                        pathParameter -> pathParameter.getName().getOriginalName(), pathParameter -> FieldSpec.builder(
                                        generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(true, pathParameter.getValueType()),
                                        pathParameter.getName().getCamelCase().getSafeName(),
                                        Modifier.PRIVATE)
                                .build()));
    }

    private Map<String, MethodSpec> getApiPathParamGetters(Map<String, FieldSpec> apiPathParamFields) {
        return generatorContext.getIr().getPathParameters().stream()
                .collect(Collectors.toMap(
                        pathParameter -> pathParameter.getName().getOriginalName(), pathParameter -> {
                            FieldSpec pathParamField = apiPathParamFields.get(
                                    pathParameter.getName().getOriginalName());
                            TypeName pathParamTypeName = generatorContext
                                    .getPoetTypeNameMapper()
                                    .convertToTypeName(true, pathParameter.getValueType());
                            return MethodSpec.methodBuilder(pathParameter
                                            .getName()
                                            .getCamelCase()
                                            .getSafeName())
                                    .addModifiers(Modifier.PUBLIC)
                                    .returns(pathParamTypeName)
                                    .addStatement("return this.$N", pathParamField)
                                    .build();
                        }));
    }

    private List<MethodSpec> getApiPathParamBuilders(Map<String, FieldSpec> apiPathParamFields) {
        return generatorContext.getIr().getPathParameters().stream()
                .map(pathParameter -> {
                    FieldSpec pathParamField =
                            apiPathParamFields.get(pathParameter.getName().getOriginalName());
                    String pathParamName =
                            pathParameter.getName().getCamelCase().getSafeName();
                    return MethodSpec.methodBuilder(pathParamName)
                            .addModifiers(Modifier.PUBLIC)
                            .returns(builderClassName)
                            .addParameter(
                                    generatorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, pathParameter.getValueType()),
                                    pathParamName)
                            .addStatement("this.$N = $L", pathParamField, pathParamName)
                            .addStatement("return this")
                            .build();
                })
                .collect(Collectors.toList());
    }

    private MethodSpec getFromMethod(
            Map<VariableId, FieldSpec> variableFields, Map<VariableId, MethodSpec> variableGetters) {
        MethodSpec.Builder fromMethod = MethodSpec.methodBuilder("from")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addParameter(className, "clientOptions")
                .addJavadoc("Create a new Builder initialized with values from an existing ClientOptions")
                .addStatement("$T builder = new $T()", builderClassName, builderClassName)
                .addStatement("builder.$L = clientOptions.$L()", environmentField.name, environmentField.name)
                // We can only copy what's accessible via public methods so we can't get headers directly
                .addStatement(
                        "builder.$L = $T.of(clientOptions.$L(null))",
                        TIMEOUT_FIELD.name,
                        Optional.class,
                        TIMEOUT_FIELD.name)
                .addStatement("builder.$L = clientOptions.$L()", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name);

        for (Map.Entry<VariableId, FieldSpec> entry : variableFields.entrySet()) {
            MethodSpec getter = variableGetters.get(entry.getKey());
            if (getter != null) {
                fromMethod.addStatement("builder.$L = clientOptions.$N()", entry.getValue().name, getter);
            }
        }

        if (clientGeneratorContext.getIr().getApiVersion().isPresent()) {
            ApiVersionScheme apiVersionScheme =
                    clientGeneratorContext.getIr().getApiVersion().get();
            if (apiVersionScheme.getHeader().isPresent()) {
                HeaderApiVersionScheme header = apiVersionScheme.getHeader().get();
                if (header.getValue().getDefault().isPresent()) {
                    // When there's a default, the field is Optional<ApiVersion> if not just ApiVersion
                    fromMethod.beginControlFlow("if (clientOptions.$L != null)", apiVersionField.name);
                    fromMethod.addStatement(
                            "builder.$L = $T.ofNullable(clientOptions.$L)",
                            apiVersionField.name,
                            Optional.class,
                            apiVersionField.name);
                    fromMethod.endControlFlow();
                    fromMethod.beginControlFlow("else");
                    fromMethod.addStatement(
                            "builder.$L = $T.of($T.$L)",
                            apiVersionField.name,
                            Optional.class,
                            clientGeneratorContext.getPoetClassNameFactory().getApiVersionClassName(),
                            header.getValue()
                                    .getDefault()
                                    .get()
                                    .getName()
                                    .getName()
                                    .getScreamingSnakeCase()
                                    .getSafeName());
                    fromMethod.endControlFlow();
                } else {
                    fromMethod.beginControlFlow("if (clientOptions.$L != null)", apiVersionField.name);
                    fromMethod.addStatement(
                            "builder.$L = clientOptions.$L", apiVersionField.name, apiVersionField.name);
                    fromMethod.endControlFlow();
                }
            }
        }

        fromMethod.addStatement("return builder");

        return fromMethod.build();
    }

    private MethodSpec getBuildMethod(
            Map<VariableId, FieldSpec> variableFields, Map<String, FieldSpec> apiPathParamFields) {
        ImmutableList.Builder<Object> argsBuilder = ImmutableList.builder();
        argsBuilder.add(
                className,
                environmentField.name,
                HEADERS_FIELD.name,
                HEADER_SUPPLIERS_FIELD.name,
                OKHTTP_CLIENT_FIELD.name);

        // Build return string conditionally based on WebSocket presence
        String returnString;
        if (webSocketFactoryField != null) {
            returnString = "return new $T($L, $L, $L, $L, this.timeout.get(), this." + MAX_RETRIES_FIELD.name
                    + ", this." + webSocketFactoryField.name;
        } else {
            returnString = "return new $T($L, $L, $L, $L, this.timeout.get(), this." + MAX_RETRIES_FIELD.name;
        }

        if (clientGeneratorContext.getIr().getApiVersion().isPresent()) {
            argsBuilder.add(apiVersionField.name);
            if (webSocketFactoryField != null) {
                returnString = "return new $T($L, $L, $L, $L, this.timeout.get(), this." + MAX_RETRIES_FIELD.name
                        + ", this." + webSocketFactoryField.name + ", $L";
            } else {
                returnString =
                        "return new $T($L, $L, $L, $L, this.timeout.get(), this." + MAX_RETRIES_FIELD.name + ", $L";
            }
        }

        Object[] args = argsBuilder.build().toArray();

        MethodSpec.Builder builder =
                MethodSpec.methodBuilder("build").addModifiers(Modifier.PUBLIC).returns(className);

        builder.addStatement(
                        "$T.Builder $L = this.$L != null ? this.$L.newBuilder() : new $T.Builder()",
                        OKHTTP_CLIENT_FIELD.type,
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        OKHTTP_CLIENT_FIELD.name,
                        OKHTTP_CLIENT_FIELD.name,
                        OKHTTP_CLIENT_FIELD.type)
                .addCode("\n")
                .beginControlFlow("if (this.$L != null)", OKHTTP_CLIENT_FIELD.name)
                .addStatement(
                        "$L.ifPresent($L -> $L.callTimeout($L, $T.SECONDS)"
                                + ".connectTimeout(0, $T.SECONDS)"
                                + ".writeTimeout(0, $T.SECONDS)"
                                + ".readTimeout(0, $T.SECONDS))",
                        TIMEOUT_FIELD.name,
                        TIMEOUT_FIELD.name,
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        TIMEOUT_FIELD.name,
                        TimeUnit.class,
                        TimeUnit.class,
                        TimeUnit.class,
                        TimeUnit.class)
                .endControlFlow()
                .beginControlFlow("else")
                .addCode(
                        "$L.callTimeout(this.$L.orElse(60), $T.SECONDS)"
                                + ".connectTimeout(0, $T.SECONDS)"
                                + ".writeTimeout(0, $T.SECONDS)"
                                + ".readTimeout(0, $T.SECONDS)",
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        TIMEOUT_FIELD.name,
                        TimeUnit.class,
                        TimeUnit.class,
                        TimeUnit.class,
                        TimeUnit.class)
                .addCode(
                        ".addInterceptor(new $T(this.$L));\n",
                        clientGeneratorContext.getPoetClassNameFactory().getRetryInterceptorClassName(),
                        MAX_RETRIES_FIELD.name)
                .endControlFlow()
                .addCode("\n")
                .addStatement("this.$L = $L.build()", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name + "Builder")
                .addStatement(
                        "this.$L = $T.of($L.callTimeoutMillis() / 1000)",
                        TIMEOUT_FIELD.name,
                        Optional.class,
                        OKHTTP_CLIENT_FIELD.name)
                .addCode("\n");

        if (variableFields.isEmpty() && apiPathParamFields.isEmpty()) {
            return builder.addStatement(returnString + ")", args).build();
        } else {
            List<String> allArgs = new java.util.ArrayList<>();
            allArgs.addAll(variableFields.values().stream()
                    .map(variableField -> "this." + variableField.name)
                    .collect(Collectors.toList()));
            allArgs.addAll(apiPathParamFields.values().stream()
                    .map(pathParamField -> "this." + pathParamField.name)
                    .collect(Collectors.toList()));
            String combinedArgs = String.join(", ", allArgs);
            return builder.addStatement(returnString + ", " + combinedArgs + ")", args)
                    .build();
        }
    }
}
