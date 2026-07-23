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
import com.fern.java.client.JavaSdkCustomConfig;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.NameUtils;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;

public final class ClientOptionsGenerator extends AbstractFileGenerator {

    public static final String HEADERS_METHOD_NAME = "headers";
    public static final String AUTH_HEADERS_METHOD_NAME = "getAuthHeaders";
    public static final String AUTH_PROVIDER_FIELD_NAME = "authProvider";

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

    private static final FieldSpec INITIAL_RETRY_DELAY_MILLIS_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Long.class)),
                    "initialRetryDelayMillis",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();

    private static final FieldSpec MAX_RETRY_DELAY_MILLIS_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Long.class)),
                    "maxRetryDelayMillis",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();

    private static final FieldSpec RETRY_JITTER_FACTOR_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Double.class)),
                    "retryJitterFactor",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();

    private static final String LOGGING_FIELD_NAME = "logging";

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
        // Fallback to IR publishConfig (local generation with explicit maven config)
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
        // Final fallback: generate default coordinate matching Fiddle's RegistryConfigFactory behavior
        // This ensures local generation matches remote generation for GitHub output mode without explicit maven config
        else {
            String fallbackCoordinate = String.format(
                    "com.%s.fern:%s-sdk", generatorConfig.getOrganization(), generatorConfig.getWorkspaceName());
            entries.put(platformHeaders.getSdkName(), fallbackCoordinate);
        }

        if (platformHeaders.getUserAgent().isPresent()) {
            entries.put(
                    platformHeaders.getUserAgent().get().getHeader(),
                    platformHeaders.getUserAgent().get().getValue());
        }
        entries.put(platformHeaders.getLanguage(), "JAVA");
        return entries;
    }

    private static final String USER_AGENT_METHOD_NAME = "getUserAgent";

    /**
     * Normalizes a {@code User-Agent} product token so it stays within the RFC 7230 token grammar. The Maven coordinate
     * is {@code groupId:artifactId}, but a colon is not a valid token character, so it is replaced with a dot (e.g.
     * {@code com.fern:imdb} -> {@code com.fern.imdb}), which is idiomatic for reverse-domain Java-style identifiers.
     */
    private static String toRfcCompliantUserAgent(String baseUserAgent) {
        return baseUserAgent.replace(':', '.');
    }

    /**
     * Builds a static helper that assembles a structured {@code User-Agent} value at runtime, following the shape
     * {@code {sdkName}/{sdkVersion} ({os}; {arch}) {runtime}/{runtimeVersion}}. The os, arch, and runtime-version
     * segments are resolved at runtime via {@link System#getProperty(String)} rather than baked in at generation time;
     * each is omitted (never emitted as a literal {@code null}) when it cannot be determined.
     */
    private static MethodSpec buildUserAgentMethod(String baseUserAgent) {
        String rfcCompliantUserAgent = toRfcCompliantUserAgent(baseUserAgent);
        return MethodSpec.methodBuilder(USER_AGENT_METHOD_NAME)
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC)
                .returns(String.class)
                .addStatement("$T userAgent = $S", String.class, rfcCompliantUserAgent)
                .addStatement("$T os = $T.getProperty($S)", String.class, System.class, "os.name")
                .addStatement("$T arch = $T.getProperty($S)", String.class, System.class, "os.arch")
                .beginControlFlow(
                        "if (arch != null && (arch.equalsIgnoreCase($S) || arch.equalsIgnoreCase($S) || arch.equalsIgnoreCase($S)))",
                        "x64",
                        "amd64",
                        "x86_64")
                .addStatement("arch = $S", "x86_64")
                .endControlFlow()
                .addStatement("$T<$T> platformParts = new $T<>()", List.class, String.class, ArrayList.class)
                .beginControlFlow("if (os != null && !os.isEmpty())")
                .addStatement("platformParts.add(os.toLowerCase($T.ROOT))", Locale.class)
                .endControlFlow()
                .beginControlFlow("if (arch != null && !arch.isEmpty())")
                .addStatement("platformParts.add(arch)")
                .endControlFlow()
                .beginControlFlow("if (!platformParts.isEmpty())")
                .addStatement("userAgent += $S + $T.join($S, platformParts) + $S", " (", String.class, "; ", ")")
                .endControlFlow()
                .addStatement("$T javaVersion = $T.getProperty($S)", String.class, System.class, "java.version")
                .addStatement("userAgent += $S", " Java")
                .beginControlFlow("if (javaVersion != null && !javaVersion.isEmpty())")
                .addStatement("userAgent += $S + javaVersion", "/")
                .endControlFlow()
                .addStatement("return userAgent")
                .build();
    }

    private final ClassName builderClassName;
    private final FieldSpec environmentField;
    private final GeneratedJavaFile requestOptionsFile;

    private final ClientGeneratorContext clientGeneratorContext;

    private final FieldSpec apiVersionField;
    private final FieldSpec webSocketFactoryField;
    private final FieldSpec authProviderField;
    private final FieldSpec loggingField;

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
        // Only create AuthProvider field if using endpoint security
        if (clientGeneratorContext.isEndpointSecurity()) {
            this.authProviderField = FieldSpec.builder(
                            clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("AuthProvider"),
                            AUTH_PROVIDER_FIELD_NAME,
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build();
        } else {
            this.authProviderField = null;
        }
        this.loggingField = FieldSpec.builder(
                        ParameterizedTypeName.get(
                                ClassName.get(Optional.class),
                                clientGeneratorContext.getPoetClassNameFactory().getLogConfigClassName()),
                        LOGGING_FIELD_NAME,
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build();
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

        String platformHeadersPutString = "";
        Optional<MethodSpec> userAgentMethod = Optional.empty();
        if (!clientGeneratorContext.getCustomConfig().omitFernHeaders()) {
            Map<String, String> platformHeaderEntries = getPlatformHeadersEntries(
                    generatorContext.getIr().getSdkConfig().getPlatformHeaders(),
                    generatorContext.getGeneratorConfig(),
                    generatorContext.getIr());
            boolean includePlatformHeaders =
                    clientGeneratorContext.getCustomConfig().includePlatformHeaders();
            Optional<String> userAgentHeaderName = generatorContext
                    .getIr()
                    .getSdkConfig()
                    .getPlatformHeaders()
                    .getUserAgent()
                    .map(userAgent -> userAgent.getHeader());
            StringBuilder putStatements = new StringBuilder();
            for (Map.Entry<String, String> entry : platformHeaderEntries.entrySet()) {
                boolean isUserAgentHeader = userAgentHeaderName.isPresent()
                        && userAgentHeaderName.get().equals(entry.getKey());
                if (isUserAgentHeader && includePlatformHeaders) {
                    userAgentMethod = Optional.of(buildUserAgentMethod(entry.getValue()));
                    putStatements.append(CodeBlock.of("put($S, $L());", entry.getKey(), USER_AGENT_METHOD_NAME)
                            .toString());
                } else if (isUserAgentHeader) {
                    putStatements.append(
                            CodeBlock.of("put($S, $S);", entry.getKey(), toRfcCompliantUserAgent(entry.getValue()))
                                    .toString());
                } else {
                    putStatements.append(CodeBlock.of("put($S, $S);", entry.getKey(), entry.getValue())
                            .toString());
                }
            }
            platformHeadersPutString = putStatements.toString();
        }

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
                        .build())
                .addParameter(ParameterSpec.builder(
                                INITIAL_RETRY_DELAY_MILLIS_FIELD.type, INITIAL_RETRY_DELAY_MILLIS_FIELD.name)
                        .build())
                .addParameter(
                        ParameterSpec.builder(MAX_RETRY_DELAY_MILLIS_FIELD.type, MAX_RETRY_DELAY_MILLIS_FIELD.name)
                                .build())
                .addParameter(ParameterSpec.builder(RETRY_JITTER_FACTOR_FIELD.type, RETRY_JITTER_FACTOR_FIELD.name)
                        .build());

        // Only add webSocketFactory parameter if WebSocket channels are present
        if (webSocketFactoryField != null) {
            constructorBuilder.addParameter(
                    ParameterSpec.builder(webSocketFactoryField.type, webSocketFactoryField.name)
                            .build());
        }

        // Only add authProvider parameter if using endpoint security
        if (authProviderField != null) {
            constructorBuilder.addParameter(ParameterSpec.builder(authProviderField.type, authProviderField.name)
                    .build());
        }

        // Add logging parameter
        constructorBuilder.addParameter(
                ParameterSpec.builder(loggingField.type, loggingField.name).build());

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
                .addStatement("this.$L.putAll($L)", HEADERS_FIELD.name, HEADERS_FIELD.name);
        if (!platformHeadersPutString.isEmpty()) {
            constructorBuilder.addStatement(
                    "this.$L.putAll(new $T<$T,$T>() {{$L}})",
                    HEADERS_FIELD.name,
                    HashMap.class,
                    String.class,
                    String.class,
                    platformHeadersPutString);
        }
        constructorBuilder
                .addStatement("this.$L = $L", HEADER_SUPPLIERS_FIELD.name, HEADER_SUPPLIERS_FIELD.name)
                .addStatement("this.$L = $L", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name)
                .addStatement("this.$L = $L", TIMEOUT_FIELD.name, TIMEOUT_FIELD.name)
                .addStatement("this.$L = $L", MAX_RETRIES_FIELD.name, MAX_RETRIES_FIELD.name)
                .addStatement(
                        "this.$L = $L", INITIAL_RETRY_DELAY_MILLIS_FIELD.name, INITIAL_RETRY_DELAY_MILLIS_FIELD.name)
                .addStatement("this.$L = $L", MAX_RETRY_DELAY_MILLIS_FIELD.name, MAX_RETRY_DELAY_MILLIS_FIELD.name)
                .addStatement("this.$L = $L", RETRY_JITTER_FACTOR_FIELD.name, RETRY_JITTER_FACTOR_FIELD.name);

        // Only add webSocketFactory assignment if WebSocket channels are present
        if (webSocketFactoryField != null) {
            constructorBuilder.addStatement("this.$L = $L", webSocketFactoryField.name, webSocketFactoryField.name);
        }

        // Only add authProvider assignment if using endpoint security
        if (authProviderField != null) {
            constructorBuilder.addStatement("this.$L = $L", authProviderField.name, authProviderField.name);
        }

        // Add logging assignment
        constructorBuilder.addStatement("this.$L = $L", loggingField.name, loggingField.name);

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
                .addField(MAX_RETRIES_FIELD)
                .addField(INITIAL_RETRY_DELAY_MILLIS_FIELD)
                .addField(MAX_RETRY_DELAY_MILLIS_FIELD)
                .addField(RETRY_JITTER_FACTOR_FIELD);

        // Only add webSocketFactory field if WebSocket channels are present
        if (webSocketFactoryField != null) {
            clientOptionsBuilder.addField(webSocketFactoryField);
        }

        // Only add authProvider field if using endpoint security
        if (authProviderField != null) {
            clientOptionsBuilder.addField(authProviderField);
        }

        // Add logging field
        clientOptionsBuilder.addField(loggingField);

        clientOptionsBuilder
                .addFields(variableFields.values())
                .addFields(apiPathParamFieldsForMainClass.values())
                .addMethod(constructorBuilder.build())
                .addMethod(environmentGetter)
                .addMethod(headersFromRequestOptions);

        if (userAgentMethod.isPresent()) {
            clientOptionsBuilder.addMethod(userAgentMethod.get());
        }

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

            clientOptionsBuilder.addMethod(buildHttpClientWithTimeoutMethod(
                    clientGeneratorContext.getPoetClassNameFactory().getIdempotentRequestOptionsClassName()));
        }

        TypeName requestOptionsClassName =
                clientGeneratorContext.getPoetClassNameFactory().getRequestOptionsClassName();
        MethodSpec httpClientWithTimeoutGetter = buildHttpClientWithTimeoutMethod(requestOptionsClassName);

        MethodSpec maxRetriesGetter = createGetter(MAX_RETRIES_FIELD);
        MethodSpec initialRetryDelayMillisGetter = createGetter(INITIAL_RETRY_DELAY_MILLIS_FIELD);
        MethodSpec maxRetryDelayMillisGetter = createGetter(MAX_RETRY_DELAY_MILLIS_FIELD);
        MethodSpec retryJitterFactorGetter = createGetter(RETRY_JITTER_FACTOR_FIELD);

        clientOptionsBuilder
                .addMethod(timeoutGetter)
                .addMethod(httpClientGetter)
                .addMethod(httpClientWithTimeoutGetter)
                .addMethod(maxRetriesGetter)
                .addMethod(initialRetryDelayMillisGetter)
                .addMethod(maxRetryDelayMillisGetter)
                .addMethod(retryJitterFactorGetter);

        // Only add webSocketFactory getter if WebSocket channels are present
        if (webSocketFactoryField != null) {
            MethodSpec webSocketFactoryGetter = createGetter(webSocketFactoryField);
            clientOptionsBuilder.addMethod(webSocketFactoryGetter);
        }

        // Add logging getter
        MethodSpec loggingGetter = createGetter(loggingField);
        clientOptionsBuilder.addMethod(loggingGetter);

        // Only add authProvider getter and getAuthHeaders method if using endpoint security
        if (authProviderField != null) {
            ClassName endpointMetadataClassName =
                    clientGeneratorContext.getPoetClassNameFactory().getCoreClassName("EndpointMetadata");
            MethodSpec getAuthHeadersMethod = MethodSpec.methodBuilder(AUTH_HEADERS_METHOD_NAME)
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(endpointMetadataClassName, "endpointMetadata")
                    .returns(ParameterizedTypeName.get(Map.class, String.class, String.class))
                    .addStatement("return this.$L.getAuthHeaders(endpointMetadata)", authProviderField.name)
                    .build();
            clientOptionsBuilder.addMethod(getAuthHeadersMethod);
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
                                    NameUtils.getWireValue(
                                            headerApiVersionScheme.getHeader().getName()))
                            .build());
                    clientOptionsBuilder.addMethod(createGetter(apiVersionField).toBuilder()
                            .addJavadoc(
                                    "$L.toString() is sent as the $S header.",
                                    apiVersionField.name,
                                    NameUtils.getWireValue(
                                            headerApiVersionScheme.getHeader().getName()))
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
                                        NameUtils.getWireValue(configuredDefaultVersion.getName()))
                                .build());

                        String configuredDefaultVersionString = NameUtils.getName(configuredDefaultVersion.getName())
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
                            NameUtils.getWireValue(
                                    headerApiVersionScheme.getHeader().getName()),
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
                        .initializer("$L", getDefaultMaxRetries())
                        .build())
                .addField(FieldSpec.builder(
                                INITIAL_RETRY_DELAY_MILLIS_FIELD.type,
                                INITIAL_RETRY_DELAY_MILLIS_FIELD.name,
                                Modifier.PRIVATE)
                        .initializer("$T.empty()", Optional.class)
                        .build())
                .addField(FieldSpec.builder(
                                MAX_RETRY_DELAY_MILLIS_FIELD.type, MAX_RETRY_DELAY_MILLIS_FIELD.name, Modifier.PRIVATE)
                        .initializer("$T.empty()", Optional.class)
                        .build())
                .addField(FieldSpec.builder(
                                RETRY_JITTER_FACTOR_FIELD.type, RETRY_JITTER_FACTOR_FIELD.name, Modifier.PRIVATE)
                        .initializer("$T.empty()", Optional.class)
                        .build())
                .addField(FieldSpec.builder(
                                ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                                TIMEOUT_FIELD.name,
                                Modifier.PRIVATE)
                        .initializer("$T.empty()", Optional.class)
                        .build())
                .addField(FieldSpec.builder(OkHttpClient.class, OKHTTP_CLIENT_FIELD.name, Modifier.PRIVATE)
                        .initializer(CodeBlock.builder().add("null").build())
                        .build())
                .addField(FieldSpec.builder(loggingField.type, loggingField.name, Modifier.PRIVATE)
                        .initializer("$T.empty()", Optional.class)
                        .build());

        // Per-phase connect/read/write timeout builder fields. Only emitted when a `timeouts` block is configured so
        // that generated output is unchanged for existing users.
        if (getTimeouts().isPresent()) {
            builder.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                            "connectTimeout",
                            Modifier.PRIVATE)
                    .initializer("$T.empty()", Optional.class)
                    .build());
            builder.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                            "readTimeout",
                            Modifier.PRIVATE)
                    .initializer("$T.empty()", Optional.class)
                    .build());
            builder.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                            "writeTimeout",
                            Modifier.PRIVATE)
                    .initializer("$T.empty()", Optional.class)
                    .build());
        }

        // Only add webSocketFactory field to builder if WebSocket channels are present
        if (webSocketFactoryField != null) {
            builder.addField(FieldSpec.builder(webSocketFactoryField.type, webSocketFactoryField.name, Modifier.PRIVATE)
                    .initializer("$T.empty()", Optional.class)
                    .build());
        }

        // Only add authProvider field to builder if using endpoint security
        if (authProviderField != null) {
            builder.addField(FieldSpec.builder(authProviderField.type, authProviderField.name, Modifier.PRIVATE)
                    .build());
        }

        // Add interceptors list field when custom-interceptors is enabled
        if (clientGeneratorContext.getCustomConfig().customInterceptors()) {
            builder.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(List.class), ClassName.get(Interceptor.class)),
                            "interceptors",
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .initializer("new $T<>()", ArrayList.class)
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
                        .addJavadoc("Override the maximum number of retries. Defaults to " + getDefaultMaxRetries()
                                + " retries.")
                        .returns(builderClassName)
                        .addParameter(TypeName.INT, MAX_RETRIES_FIELD.name)
                        .addStatement("this.$L = $L", MAX_RETRIES_FIELD.name, MAX_RETRIES_FIELD.name)
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder(INITIAL_RETRY_DELAY_MILLIS_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .addJavadoc("Override the initial delay (in milliseconds) used for exponential backoff "
                                + "between retries. Defaults to 1000 milliseconds.")
                        .returns(builderClassName)
                        .addParameter(TypeName.LONG, INITIAL_RETRY_DELAY_MILLIS_FIELD.name)
                        .addStatement(
                                "this.$L = $T.of($L)",
                                INITIAL_RETRY_DELAY_MILLIS_FIELD.name,
                                Optional.class,
                                INITIAL_RETRY_DELAY_MILLIS_FIELD.name)
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder(MAX_RETRY_DELAY_MILLIS_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .addJavadoc("Override the maximum delay (in milliseconds) between retries. "
                                + "Defaults to 60000 milliseconds.")
                        .returns(builderClassName)
                        .addParameter(TypeName.LONG, MAX_RETRY_DELAY_MILLIS_FIELD.name)
                        .addStatement(
                                "this.$L = $T.of($L)",
                                MAX_RETRY_DELAY_MILLIS_FIELD.name,
                                Optional.class,
                                MAX_RETRY_DELAY_MILLIS_FIELD.name)
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder(RETRY_JITTER_FACTOR_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .addJavadoc("Override the jitter factor (between 0 and 1) applied to retry delays. "
                                + "Defaults to 0.2.")
                        .returns(builderClassName)
                        .addParameter(TypeName.DOUBLE, RETRY_JITTER_FACTOR_FIELD.name)
                        .addStatement(
                                "this.$L = $T.of($L)",
                                RETRY_JITTER_FACTOR_FIELD.name,
                                Optional.class,
                                RETRY_JITTER_FACTOR_FIELD.name)
                        .addStatement("return this")
                        .build())
                .addMethod(MethodSpec.methodBuilder(OKHTTP_CLIENT_FIELD.name)
                        .addModifiers(Modifier.PUBLIC)
                        .returns(builderClassName)
                        .addParameter(OkHttpClient.class, OKHTTP_CLIENT_FIELD.name)
                        .addStatement("this.$L = $L", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name)
                        .addStatement("return this")
                        .build());

        // Per-phase connect/read/write timeout builder setters. Only emitted when a `timeouts` block is configured.
        if (getTimeouts().isPresent()) {
            builder.addMethod(MethodSpec.methodBuilder("connectTimeout")
                    .addModifiers(Modifier.PUBLIC)
                    .addJavadoc("Override the connect timeout in seconds.")
                    .returns(builderClassName)
                    .addParameter(TypeName.INT, "connectTimeout")
                    .addStatement("this.$L = $T.of($L)", "connectTimeout", Optional.class, "connectTimeout")
                    .addStatement("return this")
                    .build());
            builder.addMethod(MethodSpec.methodBuilder("readTimeout")
                    .addModifiers(Modifier.PUBLIC)
                    .addJavadoc("Override the read timeout in seconds.")
                    .returns(builderClassName)
                    .addParameter(TypeName.INT, "readTimeout")
                    .addStatement("this.$L = $T.of($L)", "readTimeout", Optional.class, "readTimeout")
                    .addStatement("return this")
                    .build());
            builder.addMethod(MethodSpec.methodBuilder("writeTimeout")
                    .addModifiers(Modifier.PUBLIC)
                    .addJavadoc("Override the write timeout in seconds.")
                    .returns(builderClassName)
                    .addParameter(TypeName.INT, "writeTimeout")
                    .addStatement("this.$L = $T.of($L)", "writeTimeout", Optional.class, "writeTimeout")
                    .addStatement("return this")
                    .build());
        }

        // Add addInterceptor method when custom-interceptors is enabled
        if (clientGeneratorContext.getCustomConfig().customInterceptors()) {
            builder.addMethod(MethodSpec.methodBuilder("addInterceptor")
                    .addModifiers(Modifier.PUBLIC)
                    .addJavadoc(
                            "Add a custom OkHttp interceptor to the client.\n"
                                    + "Interceptors are applied to the OkHttpClient when the client is built.\n"
                                    + "This can be used for custom request signing, logging, or other request/response modifications.\n")
                    .returns(builderClassName)
                    .addParameter(Interceptor.class, "interceptor")
                    .addStatement("this.interceptors.add(interceptor)")
                    .addStatement("return this")
                    .build());
        }

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

        // Only add authProvider method to builder if using endpoint security
        if (authProviderField != null) {
            builder.addMethod(MethodSpec.methodBuilder(authProviderField.name)
                    .addModifiers(Modifier.PUBLIC)
                    .addJavadoc("Set the authentication provider for routing auth to endpoints.\n")
                    .returns(builderClassName)
                    .addParameter(authProviderField.type, authProviderField.name)
                    .addStatement("this.$L = $L", authProviderField.name, authProviderField.name)
                    .addStatement("return this")
                    .build());
        }

        // Add logging builder method
        builder.addMethod(MethodSpec.methodBuilder(LOGGING_FIELD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc(
                        "Configure logging for the SDK. Silent by default — no log output unless explicitly configured.\n")
                .returns(builderClassName)
                .addParameter(
                        clientGeneratorContext.getPoetClassNameFactory().getLogConfigClassName(), LOGGING_FIELD_NAME)
                .addStatement("this.$L = $T.of($L)", LOGGING_FIELD_NAME, Optional.class, LOGGING_FIELD_NAME)
                .addStatement("return this")
                .build());

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
                        builder.addMethod(getOptionalVersionBuilder(NameUtils.getWireValue(
                                headerApiVersionScheme.getHeader().getName())));
                    } else {
                        builder.addField(FieldSpec.builder(
                                        clientGeneratorContext
                                                .getPoetClassNameFactory()
                                                .getApiVersionClassName(),
                                        apiVersionField.name,
                                        Modifier.PRIVATE)
                                .build());
                        builder.addMethod(getRequiredVersionBuilder(NameUtils.getWireValue(
                                headerApiVersionScheme.getHeader().getName())));
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
                // Defensively skip null header values so that no codegen path can bake a null header into
                // ClientOptions (okhttp Headers.of NPEs on null values).
                .beginControlFlow("if ($L != null)", "value")
                .addStatement("this.$L.put($L, $L)", HEADERS_FIELD.name, "key", "value")
                .endControlFlow()
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
                                NameUtils.toName(variableDeclaration.getName())
                                        .getCamelCase()
                                        .getSafeName(),
                                Modifier.PRIVATE)
                        .build()));
    }

    private List<MethodSpec> getVariableBuilders(Map<VariableId, FieldSpec> variableFields) {
        return generatorContext.getIr().getVariables().stream()
                .map(variableDeclaration -> {
                    FieldSpec variableField = variableFields.get(variableDeclaration.getId());
                    String variableParameterName = NameUtils.toName(variableDeclaration.getName())
                            .getCamelCase()
                            .getSafeName();
                    return MethodSpec.methodBuilder(NameUtils.toName(variableDeclaration.getName())
                                    .getCamelCase()
                                    .getSafeName())
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
                    return MethodSpec.methodBuilder(NameUtils.toName(variableDeclaration.getName())
                                    .getCamelCase()
                                    .getSafeName())
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
                        pathParameter ->
                                NameUtils.toName(pathParameter.getName()).getOriginalName(),
                        pathParameter -> FieldSpec.builder(
                                        generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(true, pathParameter.getValueType()),
                                        NameUtils.toName(pathParameter.getName())
                                                .getCamelCase()
                                                .getSafeName(),
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
                        pathParameter ->
                                NameUtils.toName(pathParameter.getName()).getOriginalName(),
                        pathParameter -> FieldSpec.builder(
                                        generatorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(true, pathParameter.getValueType()),
                                        NameUtils.toName(pathParameter.getName())
                                                .getCamelCase()
                                                .getSafeName(),
                                        Modifier.PRIVATE)
                                .build()));
    }

    private Map<String, MethodSpec> getApiPathParamGetters(Map<String, FieldSpec> apiPathParamFields) {
        return generatorContext.getIr().getPathParameters().stream()
                .collect(Collectors.toMap(
                        pathParameter ->
                                NameUtils.toName(pathParameter.getName()).getOriginalName(),
                        pathParameter -> {
                            FieldSpec pathParamField = apiPathParamFields.get(
                                    NameUtils.toName(pathParameter.getName()).getOriginalName());
                            TypeName pathParamTypeName = generatorContext
                                    .getPoetTypeNameMapper()
                                    .convertToTypeName(true, pathParameter.getValueType());
                            return MethodSpec.methodBuilder(NameUtils.toName(pathParameter.getName())
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
                    FieldSpec pathParamField = apiPathParamFields.get(
                            NameUtils.toName(pathParameter.getName()).getOriginalName());
                    String pathParamName = NameUtils.toName(pathParameter.getName())
                            .getCamelCase()
                            .getSafeName();
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
                .addStatement(
                        "builder.$L = $T.of(clientOptions.$L(null))",
                        TIMEOUT_FIELD.name,
                        Optional.class,
                        TIMEOUT_FIELD.name)
                .addStatement("builder.$L = clientOptions.$L()", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name)
                .addStatement("builder.$L.putAll(clientOptions.$L)", HEADERS_FIELD.name, HEADERS_FIELD.name)
                .addStatement(
                        "builder.$L.putAll(clientOptions.$L)", HEADER_SUPPLIERS_FIELD.name, HEADER_SUPPLIERS_FIELD.name)
                .addStatement("builder.$L = clientOptions.$L()", MAX_RETRIES_FIELD.name, MAX_RETRIES_FIELD.name)
                .addStatement(
                        "builder.$L = clientOptions.$L()",
                        INITIAL_RETRY_DELAY_MILLIS_FIELD.name,
                        INITIAL_RETRY_DELAY_MILLIS_FIELD.name)
                .addStatement(
                        "builder.$L = clientOptions.$L()",
                        MAX_RETRY_DELAY_MILLIS_FIELD.name,
                        MAX_RETRY_DELAY_MILLIS_FIELD.name)
                .addStatement(
                        "builder.$L = clientOptions.$L()",
                        RETRY_JITTER_FACTOR_FIELD.name,
                        RETRY_JITTER_FACTOR_FIELD.name)
                .addStatement("builder.$L = clientOptions.$L()", LOGGING_FIELD_NAME, LOGGING_FIELD_NAME);

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
                            NameUtils.getName(
                                            header.getValue().getDefault().get().getName())
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

        // Build return string with all optional fields
        StringBuilder returnStringBuilder = new StringBuilder();
        returnStringBuilder.append("return new $T($L, $L, $L, $L, this.timeout.get(), this.");
        returnStringBuilder.append(MAX_RETRIES_FIELD.name);
        returnStringBuilder.append(", this.").append(INITIAL_RETRY_DELAY_MILLIS_FIELD.name);
        returnStringBuilder.append(", this.").append(MAX_RETRY_DELAY_MILLIS_FIELD.name);
        returnStringBuilder.append(", this.").append(RETRY_JITTER_FACTOR_FIELD.name);

        // Add webSocketFactory if present
        if (webSocketFactoryField != null) {
            returnStringBuilder.append(", this.").append(webSocketFactoryField.name);
        }

        // Add authProvider if using endpoint security
        if (authProviderField != null) {
            returnStringBuilder.append(", this.").append(authProviderField.name);
        }

        // Add logging
        returnStringBuilder.append(", this.").append(LOGGING_FIELD_NAME);

        // Add apiVersion if present
        if (clientGeneratorContext.getIr().getApiVersion().isPresent()) {
            argsBuilder.add(apiVersionField.name);
            returnStringBuilder.append(", $L");
        }

        String returnString = returnStringBuilder.toString();

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
                        "$L.ifPresent($L -> $L)",
                        TIMEOUT_FIELD.name,
                        TIMEOUT_FIELD.name,
                        perPhaseTimeoutSuffix(CodeBlock.of(
                                "$L.callTimeout($L, $T.SECONDS)",
                                OKHTTP_CLIENT_FIELD.name + "Builder",
                                TIMEOUT_FIELD.name,
                                TimeUnit.class)))
                .endControlFlow()
                .beginControlFlow("else")
                .addCode(perPhaseTimeoutSuffix(CodeBlock.of(
                        "$L.callTimeout(this.$L.orElse($L), $T.SECONDS)",
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        TIMEOUT_FIELD.name,
                        getDefaultTimeoutInSeconds(),
                        TimeUnit.class)))
                .addCode(
                        ".addInterceptor(new $T(this.$L, this.$L, this.$L, this.$L));\n",
                        clientGeneratorContext.getPoetClassNameFactory().getRetryInterceptorClassName(),
                        MAX_RETRIES_FIELD.name,
                        INITIAL_RETRY_DELAY_MILLIS_FIELD.name,
                        MAX_RETRY_DELAY_MILLIS_FIELD.name,
                        RETRY_JITTER_FACTOR_FIELD.name)
                .endControlFlow()
                .addCode("\n")
                .addStatement(
                        "$T $L = $T.from(this.$L)",
                        clientGeneratorContext.getPoetClassNameFactory().getLoggerClassName(),
                        "logger",
                        clientGeneratorContext.getPoetClassNameFactory().getLoggerClassName(),
                        LOGGING_FIELD_NAME)
                .addStatement(
                        "$L.addInterceptor(new $T($L))",
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        clientGeneratorContext.getPoetClassNameFactory().getLoggingInterceptorClassName(),
                        "logger")
                .addStatement(
                        "$L.addInterceptor(new $T())",
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        clientGeneratorContext.getPoetClassNameFactory().getResponseDecompressionInterceptorClassName())
                .addCode("\n");

        // Apply per-phase timeout overrides set on the builder, winning over the configured `timeouts` defaults.
        if (getTimeouts().isPresent()) {
            builder.addStatement(
                            "this.$L.ifPresent(timeout -> $L.connectTimeout(timeout, $T.SECONDS))",
                            "connectTimeout",
                            OKHTTP_CLIENT_FIELD.name + "Builder",
                            TimeUnit.class)
                    .addStatement(
                            "this.$L.ifPresent(timeout -> $L.readTimeout(timeout, $T.SECONDS))",
                            "readTimeout",
                            OKHTTP_CLIENT_FIELD.name + "Builder",
                            TimeUnit.class)
                    .addStatement(
                            "this.$L.ifPresent(timeout -> $L.writeTimeout(timeout, $T.SECONDS))",
                            "writeTimeout",
                            OKHTTP_CLIENT_FIELD.name + "Builder",
                            TimeUnit.class)
                    .addCode("\n");
        }

        // Apply custom interceptors when custom-interceptors is enabled
        if (clientGeneratorContext.getCustomConfig().customInterceptors()) {
            builder.beginControlFlow("for ($T interceptor : this.interceptors)", Interceptor.class)
                    .addStatement("$L.addInterceptor(interceptor)", OKHTTP_CLIENT_FIELD.name + "Builder")
                    .endControlFlow()
                    .addCode("\n");
        }

        builder.addStatement("this.$L = $L.build()", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name + "Builder")
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

    private int getDefaultTimeoutInSeconds() {
        return clientGeneratorContext
                .getCustomConfig()
                .defaultTimeoutInSeconds()
                .orElse(60);
    }

    private Optional<JavaSdkCustomConfig.Timeouts> getTimeouts() {
        return clientGeneratorContext.getCustomConfig().timeouts();
    }

    /**
     * Builds the {@code httpClientWithTimeout(requestOptions)} method used to derive a per-request OkHttp client. When
     * no {@code timeouts} config is present, the generated body is byte-identical to the historical single
     * overall-timeout behavior. When {@code timeouts} is configured, the base per-phase timeouts are inherited from the
     * underlying client and any per-call connect/read/write override wins for the phase it covers.
     */
    private MethodSpec buildHttpClientWithTimeoutMethod(TypeName requestOptionsType) {
        MethodSpec.Builder method = MethodSpec.methodBuilder("httpClientWithTimeout")
                .addModifiers(Modifier.PUBLIC)
                .addParameter(requestOptionsType, REQUEST_OPTIONS_PARAMETER_NAME)
                .returns(OKHTTP_CLIENT_FIELD.type)
                .beginControlFlow("if ($L == null)", REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement("return this.$L", OKHTTP_CLIENT_FIELD.name)
                .endControlFlow();

        if (getTimeouts().isEmpty()) {
            return method.addStatement(
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
        }

        // The base client already carries the configured connect/read/write timeouts; inherit them via newBuilder()
        // and only override the overall callTimeout and any per-call phase overrides provided on the request options.
        method.addStatement(
                        "$T.Builder $L = this.$L.newBuilder().callTimeout($N.getTimeout().get(), $N.getTimeoutTimeUnit())",
                        OKHTTP_CLIENT_FIELD.type,
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        OKHTTP_CLIENT_FIELD.name,
                        REQUEST_OPTIONS_PARAMETER_NAME,
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement(
                        "$N.getConnectTimeout().ifPresent(timeout -> $L.connectTimeout(timeout, $N.getTimeoutTimeUnit()))",
                        REQUEST_OPTIONS_PARAMETER_NAME,
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement(
                        "$N.getReadTimeout().ifPresent(timeout -> $L.readTimeout(timeout, $N.getTimeoutTimeUnit()))",
                        REQUEST_OPTIONS_PARAMETER_NAME,
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement(
                        "$N.getWriteTimeout().ifPresent(timeout -> $L.writeTimeout(timeout, $N.getTimeoutTimeUnit()))",
                        REQUEST_OPTIONS_PARAMETER_NAME,
                        OKHTTP_CLIENT_FIELD.name + "Builder",
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .addStatement("return $L.build()", OKHTTP_CLIENT_FIELD.name + "Builder");
        return method.build();
    }

    private static long toMillis(double seconds) {
        return Math.round(seconds * 1000);
    }

    /**
     * Builds the {@code .connectTimeout(...).writeTimeout(...).readTimeout(...)} suffix applied to the base OkHttp
     * client. When no {@code timeouts} config is present, this preserves the historical behavior of disabling the three
     * per-phase timeouts (0 seconds) so that generated output is byte-identical. When {@code timeouts} is configured,
     * each present phase is emitted in milliseconds; absent phases stay at 0 (disabled). These coexist with the overall
     * {@code callTimeout} that is applied separately.
     */
    private CodeBlock perPhaseTimeoutSuffix(CodeBlock prefix) {
        Optional<JavaSdkCustomConfig.Timeouts> timeouts = getTimeouts();
        if (timeouts.isEmpty()) {
            return CodeBlock.of(
                    "$L.connectTimeout(0, $T.SECONDS).writeTimeout(0, $T.SECONDS).readTimeout(0, $T.SECONDS)",
                    prefix,
                    TimeUnit.class,
                    TimeUnit.class,
                    TimeUnit.class);
        }
        JavaSdkCustomConfig.Timeouts value = timeouts.get();
        return CodeBlock.of(
                "$L.connectTimeout($L, $T.MILLISECONDS).writeTimeout($L, $T.MILLISECONDS)"
                        + ".readTimeout($L, $T.MILLISECONDS)",
                prefix,
                value.connect().map(ClientOptionsGenerator::toMillis).orElse(0L),
                TimeUnit.class,
                value.write().map(ClientOptionsGenerator::toMillis).orElse(0L),
                TimeUnit.class,
                value.read().map(ClientOptionsGenerator::toMillis).orElse(0L),
                TimeUnit.class);
    }

    private int getDefaultMaxRetries() {
        return clientGeneratorContext.getCustomConfig().maxRetries().orElse(2);
    }
}
