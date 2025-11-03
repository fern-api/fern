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

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.SubpackageId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.commons.WebSocketChannelId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.ir.IPackage;
import com.fern.ir.model.ir.Subpackage;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.generators.endpoint.AbstractDelegatingHttpEndpointMethodSpecs;
import com.fern.java.client.generators.endpoint.AbstractHttpEndpointMethodSpecFactory;
import com.fern.java.client.generators.endpoint.HttpEndpointMethodSpecs;
import com.fern.java.client.generators.endpoint.RawHttpEndpointMethodSpecs;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

public abstract class AbstractClientGeneratorUtils {

    protected static final String RAW_CLIENT_NAME = "rawClient";
    protected static final String BODY_GETTER_NAME = "body";
    private static final String WITH_RAW_RESPONSES = "withRawResponse";

    protected final ClientGeneratorContext generatorContext;
    private final TypeSpec.Builder implBuilder;
    protected final FieldSpec clientOptionsField;
    private final IPackage fernPackage;
    protected final GeneratedObjectMapper generatedObjectMapper;
    protected final GeneratedClientOptions generatedClientOptions;
    protected final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final GeneratedJavaFile generatedSuppliersFile;
    protected final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final List<GeneratedWrappedRequest> generatedWrappedRequests = new ArrayList<>();
    private final GeneratedJavaFile requestOptionsFile;
    protected final Map<ErrorId, GeneratedJavaFile> generatedErrors;
    private final ClassName clientClassName;

    public AbstractClientGeneratorUtils(
            ClassName clientClassName,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedObjectMapper generatedObjectMapper,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            GeneratedJavaFile generatedSuppliersFile,
            GeneratedJavaFile requestOptionsFile,
            IPackage fernPackage,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        this.generatorContext = clientGeneratorContext;
        this.clientOptionsField = FieldSpec.builder(generatedClientOptions.getClassName(), "clientOptions")
                .addModifiers(Modifier.PROTECTED, Modifier.FINAL)
                .build();
        this.fernPackage = fernPackage;
        this.clientClassName = clientClassName;
        this.implBuilder = TypeSpec.classBuilder(clientImplName(this.clientClassName))
                .addModifiers(Modifier.PUBLIC)
                .addField(clientOptionsField);
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.generatedSuppliersFile = generatedSuppliersFile;
        this.generatedObjectMapper = generatedObjectMapper;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.requestOptionsFile = requestOptionsFile;
        this.generatedErrors = generatedErrors;
    }

    protected abstract AbstractDelegatingHttpEndpointMethodSpecs delegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs delegate);

    protected abstract ClassName clientImplName(ClassName baseClientName);

    protected abstract ClassName subpackageClientImplName(Subpackage subpackage);

    protected abstract AbstractHttpEndpointMethodSpecFactory endpointMethodSpecFactory(
            HttpService httpService, HttpEndpoint httpEndpoint);

    protected abstract ClassName rawClientImplName(ClassName baseClientName);

    public Result buildClients() {
        Optional<HttpService> maybeHttpService = fernPackage
                .getService()
                .map(serviceId -> generatorContext.getIr().getServices().get(serviceId));

        MethodSpec.Builder clientImplConstructor = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterSpec.builder(clientOptionsField.type, clientOptionsField.name)
                        .build())
                .addStatement("this.$L = $L", clientOptionsField.name, clientOptionsField.name);
        TypeSpec.Builder rawClientImplBuilder = null;
        if (maybeHttpService.isPresent()) {
            rawClientImplBuilder = TypeSpec.classBuilder(rawClientImplName(clientClassName))
                    .addModifiers(Modifier.PUBLIC)
                    .addField(clientOptionsField);
            FieldSpec rawClientFieldSpec = FieldSpec.builder(
                            rawClientImplName(clientClassName), RAW_CLIENT_NAME, Modifier.PRIVATE, Modifier.FINAL)
                    .build();

            rawClientImplBuilder.addMethod(MethodSpec.constructorBuilder()
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(ParameterSpec.builder(clientOptionsField.type, clientOptionsField.name)
                            .build())
                    .addStatement("this.$L = $L", clientOptionsField.name, clientOptionsField.name)
                    .build());

            implBuilder.addField(rawClientFieldSpec);
            implBuilder.addMethod(MethodSpec.methodBuilder(WITH_RAW_RESPONSES)
                    .returns(rawClientFieldSpec.type)
                    .addModifiers(Modifier.PUBLIC)
                    .addStatement("return this.$L", rawClientFieldSpec.name)
                    .addJavadoc("Get responses with HTTP metadata like headers")
                    .build());

            clientImplConstructor.addStatement(
                    "this.$L = new $T($L)", rawClientFieldSpec.name, rawClientFieldSpec.type, clientOptionsField.name);

            HttpService httpService = maybeHttpService.get();
            for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
                AbstractHttpEndpointMethodSpecFactory httpEndpointMethodSpecFactory =
                        endpointMethodSpecFactory(httpService, httpEndpoint);
                HttpEndpointMethodSpecs httpEndpointMethodSpecs = httpEndpointMethodSpecFactory.create();
                RawHttpEndpointMethodSpecs rawHttpEndpointMethodSpecs = new RawHttpEndpointMethodSpecs(
                        httpEndpointMethodSpecs,
                        generatorContext
                                .getPoetClassNameFactory()
                                .getHttpResponseClassName(
                                        generatorContext.getGeneratorConfig().getOrganization(),
                                        generatorContext.getGeneratorConfig().getWorkspaceName(),
                                        generatorContext.getCustomConfig()));
                AbstractDelegatingHttpEndpointMethodSpecs delegatingHttpEndpointMethodSpecs =
                        delegatingHttpEndpointMethodSpecs(httpEndpointMethodSpecs);

                if (httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().isPresent()) {
                    rawClientImplBuilder.addMethod(rawHttpEndpointMethodSpecs
                            .getNoRequestBodyMethodSpec()
                            .get());
                    implBuilder.addMethod(delegatingHttpEndpointMethodSpecs
                            .getNoRequestBodyMethodSpec()
                            .get());
                }

                rawClientImplBuilder.addMethod(rawHttpEndpointMethodSpecs.getNonRequestOptionsMethodSpec());
                implBuilder.addMethod(delegatingHttpEndpointMethodSpecs.getNonRequestOptionsMethodSpec());

                rawClientImplBuilder.addMethod(rawHttpEndpointMethodSpecs.getRequestOptionsMethodSpec());
                implBuilder.addMethod(delegatingHttpEndpointMethodSpecs.getRequestOptionsMethodSpec());

                if (httpEndpointMethodSpecs
                        .getNonRequestOptionsByteArrayMethodSpec()
                        .isPresent()) {
                    rawClientImplBuilder.addMethod(rawHttpEndpointMethodSpecs
                            .getNonRequestOptionsByteArrayMethodSpec()
                            .get());
                    implBuilder.addMethod(delegatingHttpEndpointMethodSpecs
                            .getNonRequestOptionsByteArrayMethodSpec()
                            .get());
                }

                if (httpEndpointMethodSpecs.getByteArrayMethodSpec().isPresent()) {
                    rawClientImplBuilder.addMethod(
                            rawHttpEndpointMethodSpecs.getByteArrayMethodSpec().get());
                    implBuilder.addMethod(delegatingHttpEndpointMethodSpecs
                            .getByteArrayMethodSpec()
                            .get());
                }

                generatedWrappedRequests.addAll(httpEndpointMethodSpecFactory.getGeneratedWrappedRequests());
            }
        }

        // Expose WebSocket channel client if present
        if (fernPackage.getWebsocket().isPresent()) {
            WebSocketChannelId websocketChannelId = fernPackage.getWebsocket().get();
            com.fern.ir.model.websocket.WebSocketChannel websocketChannel = generatorContext
                    .getIr()
                    .getWebsocketChannels()
                    .map(channels -> channels.get(websocketChannelId))
                    .orElse(null);

            if (websocketChannel != null) {
                // Get the WebSocket client class name
                // Determine if this is a subpackage or root package
                Optional<Subpackage> subpackageOpt =
                        fernPackage instanceof Subpackage ? Optional.of((Subpackage) fernPackage) : Optional.empty();
                ClassName webSocketClientClassName = generatorContext
                        .getPoetClassNameFactory()
                        .getWebSocketClientClassName(websocketChannel, subpackageOpt);

                // Create a factory method for the WebSocket client
                // We need to handle path and query parameters, so we create a factory method
                // rather than a simple getter
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
                            generatorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParam.getValueType());
                    webSocketFactoryMethod.addParameter(
                            paramType, pathParam.getName().getCamelCase().getSafeName());
                    webSocketFactoryMethod.addJavadoc(
                            "@param $L $L\n",
                            pathParam.getName().getCamelCase().getSafeName(),
                            pathParam
                                    .getDocs()
                                    .orElse("the "
                                            + pathParam.getName().getCamelCase().getSafeName() + " path parameter"));
                }

                // Add query parameters
                for (com.fern.ir.model.http.QueryParameter queryParam : websocketChannel.getQueryParameters()) {
                    TypeName paramType =
                            generatorContext.getPoetTypeNameMapper().convertToTypeName(true, queryParam.getValueType());
                    String paramName =
                            queryParam.getName().getName().getCamelCase().getSafeName();

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
                StringBuilder returnStatement = new StringBuilder("return new $T($N");
                for (com.fern.ir.model.http.PathParameter pathParam : websocketChannel.getPathParameters()) {
                    returnStatement
                            .append(", ")
                            .append(pathParam.getName().getCamelCase().getSafeName());
                }
                for (com.fern.ir.model.http.QueryParameter queryParam : websocketChannel.getQueryParameters()) {
                    returnStatement
                            .append(", ")
                            .append(queryParam
                                    .getName()
                                    .getName()
                                    .getCamelCase()
                                    .getSafeName());
                }
                returnStatement.append(")");

                webSocketFactoryMethod.addStatement(
                        returnStatement.toString(), webSocketClientClassName, clientOptionsField);

                implBuilder.addMethod(webSocketFactoryMethod.build());
            }
        }

        for (SubpackageId subpackageId : fernPackage.getSubpackages()) {
            Subpackage subpackage = generatorContext.getIr().getSubpackages().get(subpackageId);
            // Include subpackage if it has endpoints or WebSocket channels
            if (!subpackage.getHasEndpointsInTree()
                    && !subpackage.getWebsocket().isPresent()) {
                continue;
            }
            ClassName subpackageClientImpl = subpackageClientImplName(subpackage);
            FieldSpec clientSupplierField = FieldSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Supplier.class), subpackageClientImpl),
                            subpackage.getName().getCamelCase().getUnsafeName() + "Client")
                    .addModifiers(Modifier.PROTECTED, Modifier.FINAL)
                    .build();
            implBuilder.addField(clientSupplierField);
            clientImplConstructor.addStatement(
                    "this.$L = $T.$L(() -> new $T($L))",
                    clientSupplierField.name,
                    generatedSuppliersFile.getClassName(),
                    SuppliersGenerator.MEMOIZE_METHOD_NAME,
                    subpackageClientImpl,
                    clientOptionsField.name);
            implBuilder.addMethod(getBaseSubpackageMethod(subpackage, subpackageClientImpl)
                    .addStatement("return this.$L.get()", clientSupplierField.name)
                    .build());
        }
        implBuilder.addMethod(clientImplConstructor.build());
        return new Result(implBuilder, Optional.ofNullable(rawClientImplBuilder), generatedWrappedRequests);
    }

    private MethodSpec.Builder getBaseSubpackageMethod(Subpackage subpackage, ClassName subpackageClientInterface) {
        return MethodSpec.methodBuilder(subpackage.getName().getCamelCase().getSafeName())
                .addModifiers(Modifier.PUBLIC)
                .returns(subpackageClientInterface);
    }

    public static final class Result {
        private final TypeSpec.Builder clientImpl;
        private final Optional<TypeSpec.Builder> rawClientImpl;
        private final List<GeneratedWrappedRequest> generatedWrappedRequests;

        public Result(
                TypeSpec.Builder implBuilder,
                Optional<TypeSpec.Builder> rawClientImplBuilder,
                List<GeneratedWrappedRequest> generatedWrappedRequests) {
            this.clientImpl = implBuilder;
            this.rawClientImpl = rawClientImplBuilder;
            this.generatedWrappedRequests = generatedWrappedRequests;
        }

        public TypeSpec.Builder getClientImpl() {
            return clientImpl;
        }

        public Optional<TypeSpec.Builder> getRawClientImpl() {
            return rawClientImpl;
        }

        public List<GeneratedWrappedRequest> getGeneratedWrappedRequests() {
            return generatedWrappedRequests;
        }
    }
}
