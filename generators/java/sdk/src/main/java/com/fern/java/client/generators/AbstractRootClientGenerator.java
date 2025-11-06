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

import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.AuthSchemeKey;
import com.fern.ir.model.auth.BasicAuthScheme;
import com.fern.ir.model.auth.BearerAuthScheme;
import com.fern.ir.model.auth.EnvironmentVariable;
import com.fern.ir.model.auth.HeaderAuthScheme;
import com.fern.ir.model.auth.InferredAuthScheme;
import com.fern.ir.model.auth.OAuthClientCredentials;
import com.fern.ir.model.auth.OAuthConfiguration;
import com.fern.ir.model.auth.OAuthScheme;
import com.fern.ir.model.commons.EndpointReference;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.commons.WebSocketChannelId;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.Literal;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.SingleUrlEnvironmentClass;
import com.fern.java.client.GeneratedRootClient;
import com.fern.java.client.generators.AbstractClientGeneratorUtils.Result;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.CasingUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import okhttp3.OkHttpClient;

public abstract class AbstractRootClientGenerator extends AbstractFileGenerator {

    private static final String CLIENT_OPTIONS_BUILDER_NAME = "clientOptionsBuilder";
    private static final String ENVIRONMENT_FIELD_NAME = "environment";
    protected final GeneratedObjectMapper generatedObjectMapper;
    protected final ClientGeneratorContext clientGeneratorContext;
    protected final GeneratedClientOptions generatedClientOptions;
    protected final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final Optional<GeneratedJavaFile> generatedOAuthTokenSupplier;
    protected final GeneratedJavaFile generatedSuppliersFile;
    protected final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final ClassName builderName;
    protected final GeneratedJavaFile requestOptionsFile;
    protected final Map<ErrorId, GeneratedJavaFile> generatedErrors;

    public AbstractRootClientGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedJavaFile generatedSuppliersFile,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedJavaFile requestOptionsFile,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            Optional<GeneratedJavaFile> generatedOAuthTokenSupplier,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getRootClassName(clientGeneratorContext
                                .getCustomConfig()
                                .clientClassName()
                                .orElseGet(() -> getRootClientName(generatorContext))),
                generatorContext);
        this.generatedObjectMapper = generatedObjectMapper;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedSuppliersFile = generatedSuppliersFile;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.generatedOAuthTokenSupplier = generatedOAuthTokenSupplier;
        this.generatedErrors = generatedErrors;
        this.builderName = builderName();
        this.requestOptionsFile = requestOptionsFile;
    }

    protected abstract AbstractClientGeneratorUtils clientGeneratorUtils();

    protected abstract ClassName className();

    protected abstract ClassName rawClientName();

    protected abstract ClassName builderName();

    private void addWebSocketFactoryMethod(
            TypeSpec.Builder clientBuilder, com.fern.ir.model.websocket.WebSocketChannel websocketChannel) {
        // Get the WebSocket client class name (root level, no subpackage)
        ClassName webSocketClientClassName = clientGeneratorContext
                .getPoetClassNameFactory()
                .getWebSocketClientClassName(websocketChannel, Optional.empty());

        // Create a factory method for the WebSocket client
        MethodSpec.Builder webSocketFactoryMethod = MethodSpec.methodBuilder(
                        websocketChannel.getName().get().getCamelCase().getSafeName() + "WebSocket")
                .addModifiers(Modifier.PUBLIC)
                .returns(webSocketClientClassName)
                .addJavadoc(
                        "Creates a new WebSocket client for the $L channel.\n",
                        websocketChannel.getName().get().getCamelCase().getSafeName());

        // Add path parameters
        for (com.fern.ir.model.http.PathParameter pathParam : websocketChannel.getPathParameters()) {
            TypeName paramType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParam.getValueType());
            webSocketFactoryMethod.addParameter(
                    paramType, pathParam.getName().getCamelCase().getSafeName());
            webSocketFactoryMethod.addJavadoc(
                    "@param $L $L\n",
                    pathParam.getName().getCamelCase().getSafeName(),
                    pathParam
                            .getDocs()
                            .orElse("the " + pathParam.getName().getCamelCase().getSafeName() + " path parameter"));
        }

        // Add query parameters
        for (com.fern.ir.model.http.QueryParameter queryParam : websocketChannel.getQueryParameters()) {
            TypeName paramType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, queryParam.getValueType());
            String paramName = queryParam.getName().getName().getCamelCase().getSafeName();

            // Check if already optional
            if (!queryParam.getValueType().getContainer().isPresent()
                    || !queryParam.getValueType().getContainer().get().isOptional()) {
                paramType = ParameterizedTypeName.get(ClassName.get(Optional.class), paramType);
            }

            webSocketFactoryMethod.addParameter(paramType, paramName);
            webSocketFactoryMethod.addJavadoc(
                    "@param $L $L\n",
                    paramName,
                    queryParam.getDocs().orElse("Optional " + paramName + " query parameter"));
        }

        // Build the return statement with all parameters
        StringBuilder returnStatement = new StringBuilder("return new $T(this.clientOptions");
        for (com.fern.ir.model.http.PathParameter pathParam : websocketChannel.getPathParameters()) {
            returnStatement
                    .append(", ")
                    .append(pathParam.getName().getCamelCase().getSafeName());
        }
        for (com.fern.ir.model.http.QueryParameter queryParam : websocketChannel.getQueryParameters()) {
            returnStatement
                    .append(", ")
                    .append(queryParam.getName().getName().getCamelCase().getSafeName());
        }
        returnStatement.append(")");

        webSocketFactoryMethod.addStatement(returnStatement.toString(), webSocketClientClassName);

        clientBuilder.addMethod(webSocketFactoryMethod.build());
    }

    @Override
    public GeneratedRootClient generateFile() {
        AbstractClientGeneratorUtils clientGeneratorUtils = clientGeneratorUtils();
        Result result = clientGeneratorUtils.buildClients();

        // Add WebSocket channel factory methods to the root client
        // Only add WebSocket channels that belong to the root package, not subpackages
        if (clientGeneratorContext.getIr().getRootPackage().getWebsocket().isPresent()) {
            WebSocketChannelId channelId = clientGeneratorContext
                    .getIr()
                    .getRootPackage()
                    .getWebsocket()
                    .get();
            com.fern.ir.model.websocket.WebSocketChannel websocketChannel = clientGeneratorContext
                    .getIr()
                    .getWebsocketChannels()
                    .map(channels -> channels.get(channelId))
                    .orElse(null);
            if (websocketChannel != null) {
                addWebSocketFactoryMethod(result.getClientImpl(), websocketChannel);
            }
        }

        TypeSpec builderTypeSpec = getClientBuilder();

        boolean isExtensible = clientGeneratorContext.getCustomConfig().enableExtensibleBuilders();

        if (isExtensible) {
            ClassName implClassName = builderName.nestedClass("Impl");
            result.getClientImpl()
                    .addMethod(MethodSpec.methodBuilder("builder")
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                            .returns(implClassName)
                            .addStatement("return new $T()", implClassName)
                            .build());
        } else {
            result.getClientImpl()
                    .addMethod(MethodSpec.methodBuilder("builder")
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                            .returns(builderName)
                            .addStatement("return new $T()", builderName)
                            .build());
        }

        return GeneratedRootClient.builder()
                .className(className())
                .javaFile(JavaFile.builder(
                                className.packageName(), result.getClientImpl().build())
                        .build())
                .builderClass(GeneratedJavaFile.builder()
                        .className(builderName)
                        .javaFile(JavaFile.builder(builderName.packageName(), builderTypeSpec)
                                .build())
                        .build())
                .rawClient(result.getRawClientImpl().map(rawClient -> GeneratedJavaFile.builder()
                        .className(rawClientName())
                        .javaFile(JavaFile.builder(className.packageName(), rawClient.build())
                                .build())
                        .build()))
                .addAllWrappedRequests(result.getGeneratedWrappedRequests())
                .build();
    }

    private TypeSpec getClientBuilder() {
        boolean isExtensible = clientGeneratorContext.getCustomConfig().enableExtensibleBuilders();

        TypeSpec.Builder clientBuilder;
        if (isExtensible) {
            clientBuilder = TypeSpec.classBuilder(builderName)
                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                    .addTypeVariable(TypeVariableName.get(
                            "T", ParameterizedTypeName.get(builderName, TypeVariableName.get("T"))));

            MethodSpec selfMethod = MethodSpec.methodBuilder("self")
                    .addModifiers(Modifier.PROTECTED, Modifier.ABSTRACT)
                    .returns(TypeVariableName.get("T"))
                    .build();
            clientBuilder.addMethod(selfMethod);
        } else {
            clientBuilder = TypeSpec.classBuilder(builderName).addModifiers(Modifier.PUBLIC);
        }

        MethodSpec.Builder buildMethod =
                MethodSpec.methodBuilder("build").addModifiers(Modifier.PUBLIC).returns(className());

        clientBuilder.addField(FieldSpec.builder(
                        ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                        "timeout")
                .addModifiers(Modifier.PRIVATE)
                .initializer("$T.empty()", Optional.class)
                .build());

        clientBuilder.addField(FieldSpec.builder(
                        ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(Integer.class)),
                        "maxRetries")
                .addModifiers(Modifier.PRIVATE)
                .initializer("$T.empty()", Optional.class)
                .build());

        clientBuilder.addField(FieldSpec.builder(
                        ParameterizedTypeName.get(
                                ClassName.get(Map.class), ClassName.get(String.class), ClassName.get(String.class)),
                        "customHeaders")
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .initializer("new $T<>()", HashMap.class)
                .build());

        FieldSpec.Builder environmentFieldBuilder = FieldSpec.builder(
                        generatedEnvironmentsClass.getClassName(), ENVIRONMENT_FIELD_NAME)
                .addModifiers(Modifier.PRIVATE);

        boolean hasAuth = !generatorContext.getResolvedAuthSchemes().isEmpty();
        boolean hasCustomHeaders = !generatorContext.getIr().getHeaders().isEmpty();
        boolean hasVariables = !generatorContext.getIr().getVariables().isEmpty();

        MethodSpec.Builder configureAuthBuilder = null;
        if (hasAuth) {
            configureAuthBuilder = MethodSpec.methodBuilder("setAuthentication")
                    .addModifiers(Modifier.PROTECTED)
                    .addParameter(generatedClientOptions.builderClassName(), "builder")
                    .addJavadoc("Override this method to customize authentication.\n"
                            + "This method is called during client options construction to set up authentication headers.\n"
                            + "\n"
                            + "@param builder The ClientOptions.Builder to configure\n"
                            + "\n"
                            + "Example:\n"
                            + "<pre>{@code\n"
                            + "&#64;Override\n"
                            + "protected void setAuthentication(ClientOptions.Builder builder) {\n"
                            + "    super.setAuthentication(builder); // Keep existing auth\n"
                            + "    builder.addHeader(\"X-API-Key\", this.apiKey);\n"
                            + "}\n"
                            + "}</pre>");
        }

        MethodSpec.Builder configureCustomHeadersBuilder = null;
        if (hasCustomHeaders) {
            configureCustomHeadersBuilder = MethodSpec.methodBuilder("setCustomHeaders")
                    .addModifiers(Modifier.PROTECTED)
                    .addParameter(generatedClientOptions.builderClassName(), "builder")
                    .addJavadoc("Override this method to add or modify custom headers.\n"
                            + "This method is called during client options construction to set up custom headers defined in the API.\n"
                            + "\n"
                            + "@param builder The ClientOptions.Builder to configure\n"
                            + "\n"
                            + "Example:\n"
                            + "<pre>{@code\n"
                            + "&#64;Override\n"
                            + "protected void setCustomHeaders(ClientOptions.Builder builder) {\n"
                            + "    super.setCustomHeaders(builder); // Keep existing headers\n"
                            + "    builder.addHeader(\"X-Trace-ID\", generateTraceId());\n"
                            + "}\n"
                            + "}</pre>");
        }

        if (hasAuth || hasCustomHeaders) {
            AuthSchemeHandler authSchemeHandler = new AuthSchemeHandler(
                    clientBuilder, buildMethod, configureAuthBuilder, configureCustomHeadersBuilder, isExtensible);

            if (hasAuth) {
                generatorContext.getResolvedAuthSchemes().forEach(authScheme -> authScheme.visit(authSchemeHandler));
            }

            if (hasCustomHeaders) {
                generatorContext.getIr().getHeaders().forEach(httpHeader -> {
                    authSchemeHandler.visitNonAuthHeader(HeaderAuthScheme.builder()
                            .key(AuthSchemeKey.of(httpHeader.getName().getWireValue()))
                            .name(httpHeader.getName())
                            .valueType(httpHeader.getValueType())
                            .docs(httpHeader.getDocs())
                            .build());
                });
            }
        }

        if (generatedEnvironmentsClass.defaultEnvironmentConstant().isPresent()) {
            environmentFieldBuilder.initializer(
                    "$T.$L",
                    generatedEnvironmentsClass.getClassName(),
                    generatedEnvironmentsClass.defaultEnvironmentConstant().get());
        }
        if (generatedEnvironmentsClass.optionsPresent()) {
            MethodSpec environmentMethod = MethodSpec.methodBuilder("environment")
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(generatedEnvironmentsClass.getClassName(), "environment")
                    .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                    .build();
            clientBuilder.addMethod(environmentMethod.toBuilder()
                    .addStatement("this.$L = $L", ENVIRONMENT_FIELD_NAME, "environment")
                    .addStatement(isExtensible ? "return self()" : "return this")
                    .build());
        }

        FieldSpec environmentField = environmentFieldBuilder.build();
        clientBuilder.addField(environmentField);

        if (generatedEnvironmentsClass.info() instanceof SingleUrlEnvironmentClass) {
            SingleUrlEnvironmentClass singleUrlEnvironmentClass =
                    ((SingleUrlEnvironmentClass) generatedEnvironmentsClass.info());
            MethodSpec urlMethod = MethodSpec.methodBuilder("url")
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(String.class, "url")
                    .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                    .build();
            clientBuilder.addMethod(urlMethod.toBuilder()
                    .addStatement(
                            "this.$L = $T.$N($L)",
                            ENVIRONMENT_FIELD_NAME,
                            generatedEnvironmentsClass.getClassName(),
                            singleUrlEnvironmentClass.getCustomMethod(),
                            "url")
                    .addStatement(isExtensible ? "return self()" : "return this")
                    .build());
        }

        clientBuilder.addMethod(MethodSpec.methodBuilder("timeout")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Sets the timeout (in seconds) for the client. Defaults to 60 seconds.")
                .addParameter(int.class, "timeout")
                .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                .addStatement("this.timeout = $T.of(timeout)", Optional.class)
                .addStatement(isExtensible ? "return self()" : "return this")
                .build());

        clientBuilder.addMethod(MethodSpec.methodBuilder("maxRetries")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Sets the maximum number of retries for the client. Defaults to 2 retries.")
                .addParameter(int.class, "maxRetries")
                .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                .addStatement("this.maxRetries = $T.of(maxRetries)", Optional.class)
                .addStatement(isExtensible ? "return self()" : "return this")
                .build());

        clientBuilder.addField(FieldSpec.builder(OkHttpClient.class, "httpClient")
                .addModifiers(Modifier.PRIVATE)
                .build());

        clientBuilder.addMethod(MethodSpec.methodBuilder("httpClient")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Sets the underlying OkHttp client")
                .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                .addParameter(OkHttpClient.class, "httpClient")
                .addStatement("this.httpClient = httpClient")
                .addStatement(isExtensible ? "return self()" : "return this")
                .build());

        clientBuilder.addMethod(MethodSpec.methodBuilder("addHeader")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Add a custom header to be sent with all requests.\n"
                        + "For headers that need to be computed dynamically or conditionally, "
                        + "use the setAdditional() method override instead.\n"
                        + "\n"
                        + "@param name The header name\n"
                        + "@param value The header value\n"
                        + "@return This builder for method chaining")
                .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                .addParameter(String.class, "name")
                .addParameter(String.class, "value")
                .addStatement("this.customHeaders.put(name, value)")
                .addStatement(isExtensible ? "return self()" : "return this")
                .build());

        generatorContext.getIr().getVariables().forEach(variableDeclaration -> {
            String variableName = variableDeclaration.getName().getCamelCase().getSafeName();
            clientBuilder.addField(FieldSpec.builder(
                            generatorContext
                                    .getPoetTypeNameMapper()
                                    .convertToTypeName(true, variableDeclaration.getType()),
                            variableName)
                    .addModifiers(Modifier.PRIVATE)
                    .build());
        });

        generatorContext.getIr().getVariables().stream()
                .map(variableDeclaration -> {
                    String variableName =
                            variableDeclaration.getName().getCamelCase().getSafeName();
                    return MethodSpec.methodBuilder(variableName)
                            .addModifiers(Modifier.PUBLIC)
                            .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                            .addParameter(
                                    generatorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, variableDeclaration.getType()),
                                    variableName)
                            .addStatement("this.$L = $L", variableName, variableName)
                            .addStatement(isExtensible ? "return self()" : "return this")
                            .build();
                })
                .forEach(clientBuilder::addMethod);

        generatorContext.getIr().getPathParameters().forEach(pathParameter -> {
            String pathParamName = pathParameter.getName().getCamelCase().getSafeName();
            clientBuilder.addField(FieldSpec.builder(
                            generatorContext
                                    .getPoetTypeNameMapper()
                                    .convertToTypeName(true, pathParameter.getValueType()),
                            pathParamName)
                    .addModifiers(Modifier.PRIVATE)
                    .build());
        });

        generatorContext.getIr().getPathParameters().stream()
                .map(pathParameter -> {
                    String pathParamName =
                            pathParameter.getName().getCamelCase().getSafeName();
                    return MethodSpec.methodBuilder(pathParamName)
                            .addModifiers(Modifier.PUBLIC)
                            .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                            .addParameter(
                                    generatorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, pathParameter.getValueType()),
                                    pathParamName)
                            .addStatement("this.$L = $L", pathParamName, pathParamName)
                            .addStatement(isExtensible ? "return self()" : "return this")
                            .build();
                })
                .forEach(clientBuilder::addMethod);

        MethodSpec.Builder buildClientOptionsMethodBuilder = MethodSpec.methodBuilder("buildClientOptions")
                .addModifiers(Modifier.PROTECTED)
                .returns(generatedClientOptions.getClassName())
                .addStatement(
                        "$T builder = $T.builder()",
                        generatedClientOptions.builderClassName(),
                        generatedClientOptions.getClassName());

        buildClientOptionsMethodBuilder.addStatement("setEnvironment(builder)");

        if (hasAuth) {
            buildClientOptionsMethodBuilder.addStatement("setAuthentication(builder)");
        }

        if (hasCustomHeaders) {
            buildClientOptionsMethodBuilder.addStatement("setCustomHeaders(builder)");
        }

        if (hasVariables) {
            buildClientOptionsMethodBuilder.addStatement("setVariables(builder)");
        }

        boolean hasApiPathParams = !generatorContext.getIr().getPathParameters().isEmpty();
        if (hasApiPathParams) {
            buildClientOptionsMethodBuilder.addStatement("setApiPathParameters(builder)");
        }

        buildClientOptionsMethodBuilder
                .addStatement("setHttpClient(builder)")
                .addStatement("setTimeouts(builder)")
                .addStatement("setRetries(builder)")
                .beginControlFlow("for ($T.Entry<String, String> header : this.customHeaders.entrySet())", Map.class)
                .addStatement("builder.addHeader(header.getKey(), header.getValue())")
                .endControlFlow()
                .addStatement("setAdditional(builder)")
                .addStatement("return builder.build()");

        clientBuilder.addMethod(buildClientOptionsMethodBuilder.build());

        MethodSpec setEnvironmentMethod = MethodSpec.methodBuilder("setEnvironment")
                .addModifiers(Modifier.PROTECTED)
                .addParameter(generatedClientOptions.builderClassName(), "builder")
                .addJavadoc("Sets the environment configuration for the client.\n"
                        + "Override this method to modify URLs or add environment-specific logic.\n"
                        + "\n"
                        + "@param builder The ClientOptions.Builder to configure")
                .addStatement("builder.$N(this.$N)", generatedClientOptions.environment(), environmentField)
                .build();
        clientBuilder.addMethod(setEnvironmentMethod);

        if (hasAuth) {
            clientBuilder.addMethod(configureAuthBuilder.build());
        }

        if (hasCustomHeaders) {
            clientBuilder.addMethod(configureCustomHeadersBuilder.build());
        }

        if (hasVariables) {
            MethodSpec.Builder setVariablesMethodBuilder = MethodSpec.methodBuilder("setVariables")
                    .addModifiers(Modifier.PROTECTED)
                    .addParameter(generatedClientOptions.builderClassName(), "builder")
                    .addJavadoc("Override this method to configure API variables defined in the specification.\n"
                            + "Available variables: "
                            + generatorContext.getIr().getVariables().stream()
                                    .map(v -> v.getName().getCamelCase().getSafeName())
                                    .collect(java.util.stream.Collectors.joining(", "))
                            + "\n\n"
                            + "@param builder The ClientOptions.Builder to configure");

            generatorContext.getIr().getVariables().forEach(variableDeclaration -> {
                String variableName =
                        variableDeclaration.getName().getCamelCase().getSafeName();
                MethodSpec variableMethod =
                        generatedClientOptions.variableGetters().get(variableDeclaration.getId());
                setVariablesMethodBuilder
                        .beginControlFlow("if (this.$L != null)", variableName)
                        .addStatement("builder.$N(this.$L)", variableMethod, variableName)
                        .endControlFlow();
            });

            clientBuilder.addMethod(setVariablesMethodBuilder.build());
        }

        if (hasApiPathParams) {
            MethodSpec.Builder setApiPathParametersMethodBuilder = MethodSpec.methodBuilder("setApiPathParameters")
                    .addModifiers(Modifier.PROTECTED)
                    .addParameter(generatedClientOptions.builderClassName(), "builder")
                    .addJavadoc(
                            "Override this method to configure API-level path parameters defined in the specification.\n"
                                    + "Available path parameters: "
                                    + generatorContext.getIr().getPathParameters().stream()
                                            .map(p -> p.getName().getCamelCase().getSafeName())
                                            .collect(java.util.stream.Collectors.joining(", "))
                                    + "\n\n"
                                    + "@param builder The ClientOptions.Builder to configure");

            generatorContext.getIr().getPathParameters().forEach(pathParameter -> {
                String pathParamName = pathParameter.getName().getCamelCase().getSafeName();
                String originalName = pathParameter.getName().getOriginalName();
                MethodSpec pathParamMethod =
                        generatedClientOptions.apiPathParamGetters().get(originalName);
                setApiPathParametersMethodBuilder
                        .beginControlFlow("if (this.$L != null)", pathParamName)
                        .addStatement("builder.$N(this.$L)", pathParamMethod, pathParamName)
                        .endControlFlow();
            });

            clientBuilder.addMethod(setApiPathParametersMethodBuilder.build());
        }

        MethodSpec setTimeoutsMethod = MethodSpec.methodBuilder("setTimeouts")
                .addModifiers(Modifier.PROTECTED)
                .addParameter(generatedClientOptions.builderClassName(), "builder")
                .addJavadoc("Sets the request timeout configuration.\n"
                        + "Override this method to customize timeout behavior.\n"
                        + "\n"
                        + "@param builder The ClientOptions.Builder to configure")
                .beginControlFlow("if (this.timeout.isPresent())")
                .addStatement("builder.timeout(this.timeout.get())")
                .endControlFlow()
                .build();
        clientBuilder.addMethod(setTimeoutsMethod);

        MethodSpec setRetriesMethod = MethodSpec.methodBuilder("setRetries")
                .addModifiers(Modifier.PROTECTED)
                .addParameter(generatedClientOptions.builderClassName(), "builder")
                .addJavadoc("Sets the retry configuration for failed requests.\n"
                        + "Override this method to implement custom retry strategies.\n"
                        + "\n"
                        + "@param builder The ClientOptions.Builder to configure")
                .beginControlFlow("if (this.maxRetries.isPresent())")
                .addStatement("builder.maxRetries(this.maxRetries.get())")
                .endControlFlow()
                .build();
        clientBuilder.addMethod(setRetriesMethod);

        MethodSpec setHttpClientMethod = MethodSpec.methodBuilder("setHttpClient")
                .addModifiers(Modifier.PROTECTED)
                .addParameter(generatedClientOptions.builderClassName(), "builder")
                .addJavadoc("Sets the OkHttp client configuration.\n"
                        + "Override this method to customize HTTP client behavior (interceptors, connection pools, etc).\n"
                        + "\n"
                        + "@param builder The ClientOptions.Builder to configure")
                .beginControlFlow("if (this.httpClient != null)")
                .addStatement("builder.httpClient(this.httpClient)")
                .endControlFlow()
                .build();
        clientBuilder.addMethod(setHttpClientMethod);

        MethodSpec setAdditionalMethod = MethodSpec.methodBuilder("setAdditional")
                .addModifiers(Modifier.PROTECTED)
                .addParameter(generatedClientOptions.builderClassName(), "builder")
                .addJavadoc("Override this method to add any additional configuration to the client.\n"
                        + "This method is called at the end of the configuration chain, allowing you to add\n"
                        + "custom headers, modify settings, or perform any other client customization.\n"
                        + "\n"
                        + "@param builder The ClientOptions.Builder to configure\n"
                        + "\n"
                        + "Example:\n"
                        + "<pre>{@code\n"
                        + "&#64;Override\n"
                        + "protected void setAdditional(ClientOptions.Builder builder) {\n"
                        + "    builder.addHeader(\"X-Request-ID\", () -&gt; UUID.randomUUID().toString());\n"
                        + "    builder.addHeader(\"X-Client-Version\", \"1.0.0\");\n"
                        + "}\n"
                        + "}</pre>")
                .build();
        clientBuilder.addMethod(setAdditionalMethod);

        MethodSpec validateConfigurationMethod = MethodSpec.methodBuilder("validateConfiguration")
                .addModifiers(Modifier.PROTECTED)
                .addJavadoc("Override this method to add custom validation logic before the client is built.\n"
                        + "This method is called at the beginning of the build() method to ensure the configuration is valid.\n"
                        + "Throw an exception to prevent client creation if validation fails.\n"
                        + "\n"
                        + "Example:\n"
                        + "<pre>{@code\n"
                        + "&#64;Override\n"
                        + "protected void validateConfiguration() {\n"
                        + "    super.validateConfiguration(); // Run parent validations\n"
                        + "    if (tenantId == null || tenantId.isEmpty()) {\n"
                        + "        throw new IllegalStateException(\"tenantId is required\");\n"
                        + "    }\n"
                        + "}\n"
                        + "}</pre>")
                .build();
        clientBuilder.addMethod(validateConfigurationMethod);

        clientBuilder.addMethod(buildMethod
                .addStatement("validateConfiguration()")
                .addStatement("return new $T(buildClientOptions())", className())
                .build());

        if (isExtensible) {
            ClassName implClassName = builderName.nestedClass("Impl");
            TypeSpec.Builder implBuilder = TypeSpec.classBuilder("Impl")
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                    .superclass(ParameterizedTypeName.get(builderName, implClassName))
                    .addMethod(MethodSpec.methodBuilder("self")
                            .addAnnotation(Override.class)
                            .addModifiers(Modifier.PROTECTED)
                            .returns(implClassName)
                            .addStatement("return this")
                            .build());

            clientBuilder.addType(implBuilder.build());
        }

        return clientBuilder.build();
    }

    private static String getRootClientName(AbstractGeneratorContext<?, ?> generatorContext) {
        return getRootClientPrefix(generatorContext) + "Client";
    }

    private static String getRootClientPrefix(AbstractGeneratorContext<?, ?> generatorContext) {
        return CasingUtils.convertKebabCaseToUpperCamelCase(
                        generatorContext.getGeneratorConfig().getOrganization())
                + CasingUtils.convertKebabCaseToUpperCamelCase(
                        generatorContext.getGeneratorConfig().getWorkspaceName());
    }

    private final class AuthSchemeHandler implements AuthScheme.Visitor<Void> {

        private final TypeSpec.Builder clientBuilder;
        private final MethodSpec.Builder buildMethod;
        private final MethodSpec.Builder configureAuthMethod;
        private final MethodSpec.Builder configureCustomHeadersMethod;
        private final boolean isMandatory;
        private final boolean isExtensible;

        private AuthSchemeHandler(
                TypeSpec.Builder clientBuilder,
                MethodSpec.Builder buildMethod,
                MethodSpec.Builder configureAuthMethod,
                MethodSpec.Builder configureCustomHeadersMethod,
                boolean isExtensible) {
            this.clientBuilder = clientBuilder;
            this.buildMethod = buildMethod;
            this.configureAuthMethod = configureAuthMethod;
            this.configureCustomHeadersMethod = configureCustomHeadersMethod;
            this.isMandatory = clientGeneratorContext.getIr().getSdkConfig().getIsAuthMandatory();
            this.isExtensible = isExtensible;
        }

        @Override
        public Void visitBearer(BearerAuthScheme bearer) {
            String fieldName = bearer.getToken().getCamelCase().getSafeName();
            createSetter(fieldName, bearer.getTokenEnvVar(), Optional.empty());

            if (isMandatory) {
                this.buildMethod
                        .beginControlFlow("if ($L == null)", fieldName)
                        .addStatement(
                                "throw new RuntimeException($S)",
                                bearer.getTokenEnvVar().isEmpty()
                                        ? getErrorMessage(fieldName)
                                        : getErrorMessage(
                                                fieldName,
                                                bearer.getTokenEnvVar().get()))
                        .endControlFlow();
            }

            if (this.configureAuthMethod != null) {
                this.configureAuthMethod
                        .beginControlFlow("if (this.$L != null)", fieldName)
                        .addStatement("builder.addHeader($S, $S + this.$L)", "Authorization", "Bearer ", fieldName)
                        .endControlFlow();
            }
            return null;
        }

        @Override
        public Void visitBasic(BasicAuthScheme basic) {
            // username
            String usernameFieldName = basic.getUsername().getCamelCase().getSafeName();
            FieldSpec.Builder usernameField =
                    FieldSpec.builder(String.class, usernameFieldName).addModifiers(Modifier.PRIVATE);
            if (basic.getUsernameEnvVar().isPresent()) {
                usernameField.initializer(
                        "System.getenv($S)", basic.getUsernameEnvVar().get().get());
            } else {
                usernameField.initializer("null");
            }
            this.clientBuilder.addField(usernameField.build());

            String passwordFieldName = basic.getPassword().getCamelCase().getSafeName();
            FieldSpec.Builder passwordField =
                    FieldSpec.builder(String.class, passwordFieldName).addModifiers(Modifier.PRIVATE);
            if (basic.getPasswordEnvVar().isPresent()) {
                passwordField.initializer(
                        "System.getenv($S)", basic.getPasswordEnvVar().get().get());
            } else {
                passwordField.initializer("null");
            }
            this.clientBuilder.addField(passwordField.build());

            ParameterSpec usernameParam =
                    ParameterSpec.builder(String.class, usernameFieldName).build();
            ParameterSpec passwordParam =
                    ParameterSpec.builder(String.class, passwordFieldName).build();
            this.clientBuilder.addMethod(MethodSpec.methodBuilder("credentials")
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(usernameParam)
                    .addParameter(passwordParam)
                    .addStatement("this.$L = $L", usernameFieldName, usernameFieldName)
                    .addStatement("this.$L = $L", passwordFieldName, passwordFieldName)
                    .addStatement(isExtensible ? "return self()" : "return this")
                    .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                    .build());

            if (isMandatory) {
                this.buildMethod
                        .beginControlFlow("if (this.$L == null)", usernameFieldName)
                        .addStatement(
                                "throw new RuntimeException($S)",
                                basic.getUsernameEnvVar().isEmpty()
                                        ? getErrorMessage(usernameFieldName)
                                        : getErrorMessage(
                                                usernameFieldName,
                                                basic.getUsernameEnvVar().get()))
                        .endControlFlow();
                this.buildMethod
                        .beginControlFlow("if (this.$L == null)", passwordFieldName)
                        .addStatement(
                                "throw new RuntimeException($S)",
                                basic.getPasswordEnvVar().isEmpty()
                                        ? getErrorMessage(passwordFieldName)
                                        : getErrorMessage(
                                                passwordFieldName,
                                                basic.getPasswordEnvVar().get()))
                        .endControlFlow();
            }

            if (this.configureAuthMethod != null) {
                this.configureAuthMethod
                        .beginControlFlow(
                                "if (this.$L != null && this.$L != null)", usernameFieldName, passwordFieldName)
                        .addStatement(
                                "String unencodedToken = this.$L + \":\" + this.$L",
                                usernameFieldName,
                                passwordFieldName)
                        .addStatement(
                                "String encodedToken = $T.getEncoder().encodeToString(unencodedToken.getBytes())",
                                Base64.class)
                        .addStatement("builder.addHeader($S, $S + encodedToken)", "Authorization", "Basic ")
                        .endControlFlow();
            }
            return null;
        }

        @Override
        public Void visitHeader(HeaderAuthScheme header) {
            return visitHeaderBase(header, true);
        }

        @Override
        public Void visitOauth(OAuthScheme oauth) {
            return oauth.getConfiguration().visit(new OAuthSchemeHandler());
        }

        @Override
        public Void visitInferred(InferredAuthScheme inferred) {
            throw new UnsupportedOperationException("Inferred auth schemes are not supported");
        }

        public class OAuthSchemeHandler implements OAuthConfiguration.Visitor<Void> {

            @Override
            public Void visitClientCredentials(OAuthClientCredentials clientCredentials) {
                EndpointReference tokenEndpointReference =
                        clientCredentials.getTokenEndpoint().getEndpointReference();

                createSetter("clientId", clientCredentials.getClientIdEnvVar(), Optional.empty());
                createSetter("clientSecret", clientCredentials.getClientSecretEnvVar(), Optional.empty());

                Subpackage subpackage = clientGeneratorContext
                        .getIr()
                        .getSubpackages()
                        .get(tokenEndpointReference.getSubpackageId().get());
                ClassName authClientClassName =
                        clientGeneratorContext.getPoetClassNameFactory().getClientClassName(subpackage);
                ClassName oauthTokenSupplierClassName =
                        generatedOAuthTokenSupplier.get().getClassName();
                if (configureAuthMethod != null) {
                    configureAuthMethod.beginControlFlow("if (this.clientId != null && this.clientSecret != null)");

                    configureAuthMethod.addStatement(
                            "$T.Builder authClientOptionsBuilder = $T.builder().environment(this.$L)",
                            generatedClientOptions.getClassName(),
                            generatedClientOptions.getClassName(),
                            ENVIRONMENT_FIELD_NAME);

                    generatorContext.getIr().getVariables().forEach(variableDeclaration -> {
                        String variableName =
                                variableDeclaration.getName().getCamelCase().getSafeName();
                        MethodSpec variableMethod =
                                generatedClientOptions.variableGetters().get(variableDeclaration.getId());
                        configureAuthMethod
                                .beginControlFlow("if (this.$L != null)", variableName)
                                .addStatement("authClientOptionsBuilder.$N(this.$L)", variableMethod, variableName)
                                .endControlFlow();
                    });

                    configureAuthMethod
                            .addStatement(
                                    "$T authClient = new $T(authClientOptionsBuilder.build())",
                                    authClientClassName,
                                    authClientClassName)
                            .addStatement(
                                    "$T oAuthTokenSupplier = new $T(this.clientId, this.clientSecret, authClient)",
                                    oauthTokenSupplierClassName,
                                    oauthTokenSupplierClassName)
                            .addStatement("builder.addHeader($S, oAuthTokenSupplier)", "Authorization")
                            .endControlFlow();
                }
                return null;
            }

            @Override
            public Void _visitUnknown(Object unknownType) {
                throw new RuntimeException("Encountered unknown oauth scheme" + unknownType);
            }
        }

        public Void visitNonAuthHeader(HeaderAuthScheme header) {
            return visitHeaderBase(header, false);
        }

        public Void visitHeaderBase(HeaderAuthScheme header, Boolean respectMandatoryAuth) {
            String fieldName = header.getName().getName().getCamelCase().getSafeName();
            // Never not create a setter or a null check if it's a literal
            if ((respectMandatoryAuth && isMandatory)
                    || !(header.getValueType().isContainer()
                            && header.getValueType().getContainer().get().isLiteral())) {
                createSetter(fieldName, header.getHeaderEnvVar(), Optional.empty());
                if ((respectMandatoryAuth && isMandatory)
                        || !(header.getValueType().isContainer()
                                && header.getValueType().getContainer().get().isOptional())) {
                    this.buildMethod
                            .beginControlFlow("if ($L == null)", fieldName)
                            .addStatement(
                                    "throw new RuntimeException($S)",
                                    header.getHeaderEnvVar().isEmpty()
                                            ? getErrorMessage(fieldName)
                                            : getErrorMessage(
                                                    fieldName,
                                                    header.getHeaderEnvVar().get()))
                            .endControlFlow();
                }
            } else {
                Literal literal =
                        header.getValueType().getContainer().get().getLiteral().get();

                createSetter(fieldName, header.getHeaderEnvVar(), Optional.of(literal));
            }

            MethodSpec.Builder targetMethod =
                    respectMandatoryAuth ? this.configureAuthMethod : this.configureCustomHeadersMethod;

            if (targetMethod == null) {
                return null;
            }

            Boolean shouldWrapInConditional = header.getValueType().isContainer()
                    && header.getValueType().getContainer().get().isOptional();
            MethodSpec.Builder maybeConditionalAdditionFlow = targetMethod;
            // If the header is optional, wrap the add in a presence check so it does not get added unless it's non-null
            if (shouldWrapInConditional) {
                maybeConditionalAdditionFlow = targetMethod.beginControlFlow("if (this.$L != null)", fieldName);
            }

            if (header.getPrefix().isPresent()) {
                maybeConditionalAdditionFlow = maybeConditionalAdditionFlow.addStatement(
                        "builder.addHeader($S, $S + this.$L)",
                        header.getName().getWireValue(),
                        header.getPrefix().get(),
                        fieldName);
            } else {
                maybeConditionalAdditionFlow = maybeConditionalAdditionFlow.addStatement(
                        "builder.addHeader($S, this.$L)", header.getName().getWireValue(), fieldName);
            }

            if (shouldWrapInConditional) {
                maybeConditionalAdditionFlow.endControlFlow();
            }
            return null;
        }

        private void createSetter(
                String fieldName, Optional<EnvironmentVariable> environmentVariable, Optional<Literal> literal) {
            FieldSpec.Builder field = FieldSpec.builder(String.class, fieldName).addModifiers(Modifier.PRIVATE);
            if (environmentVariable.isPresent()) {
                field.initializer("System.getenv($S)", environmentVariable.get().get());
            } else if (literal.isPresent()) {
                literal.get().visit(new Literal.Visitor<Void>() {
                    @Override
                    public Void visitString(String string) {
                        field.initializer("$S", string);
                        return null;
                    }

                    // Convert bool headers to string
                    @Override
                    public Void visitBoolean(boolean boolean_) {
                        field.initializer("$S", boolean_);
                        return null;
                    }

                    @Override
                    public Void _visitUnknown(Object unknownType) {
                        return null;
                    }
                });
            } else {
                field.initializer("null");
            }
            clientBuilder.addField(field.build());

            MethodSpec.Builder setter = MethodSpec.methodBuilder(fieldName)
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(String.class, fieldName)
                    .returns(isExtensible ? TypeVariableName.get("T") : builderName)
                    .addJavadoc("Sets $L", fieldName)
                    .addStatement("this.$L = $L", fieldName, fieldName)
                    .addStatement(isExtensible ? "return self()" : "return this");
            if (environmentVariable.isPresent()) {
                setter.addJavadoc(
                        ".\nDefaults to the $L environment variable.",
                        environmentVariable.get().get());
            }
            clientBuilder.addMethod(setter.build());
        }

        private String getErrorMessage(String fieldName) {
            return "Please provide " + fieldName;
        }

        private String getErrorMessage(String fieldName, EnvironmentVariable environmentVariable) {
            return "Please provide " + fieldName + " or set the " + environmentVariable.get() + " "
                    + "environment variable.";
        }

        @Override
        public Void _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown auth scheme");
        }
    }
}
