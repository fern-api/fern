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

package com.fern.java.client.generators.endpoint;

import com.fern.ir.v12.model.http.HttpEndpoint;
import com.fern.ir.v12.model.http.HttpService;
import com.fern.ir.v12.model.http.SdkRequest;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.GeneratedWrappedRequest.InlinedRequestBodyGetters;
import com.fern.java.client.GeneratedWrappedRequest.ReferencedRequestBodyGetter;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.Request;
import okhttp3.RequestBody;

public final class WrappedRequestEndpointWriter extends AbstractEndpointWriter {

    public static final String REQUEST_BODY_PROPERTIES_NAME = "_requestBodyProperties";

    private final GeneratedWrappedRequest generatedWrappedRequest;
    private final ClientGeneratorContext clientGeneratorContext;
    private final SdkRequest sdkRequest;

    private final String requestParameterName;

    public WrappedRequestEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            ClientGeneratorContext clientGeneratorContext,
            SdkRequest sdkRequest,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedWrappedRequest generatedWrappedRequest) {
        super(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                clientGeneratorContext,
                clientOptionsField,
                generatedClientOptions,
                generatedEnvironmentsClass);
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedWrappedRequest = generatedWrappedRequest;
        this.sdkRequest = sdkRequest;
        this.requestParameterName =
                sdkRequest.getRequestParameterName().getCamelCase().getSafeName();
    }

    @Override
    public List<ParameterSpec> additionalParameters() {
        return Collections.singletonList(
                ParameterSpec.builder(generatedWrappedRequest.getClassName(), requestParameterName)
                        .build());
    }

    @Override
    public CodeBlock getInitializeHttpUrlCodeBlock(
            FieldSpec clientOptionsMember, GeneratedClientOptions clientOptions, List<ParameterSpec> pathParameters) {
        CodeBlock.Builder httpUrlBuilder = CodeBlock.builder()
                .add(
                        "$T $L = $T.parse(this.$L.$N().$L()).newBuilder()\n",
                        HttpUrl.Builder.class,
                        HTTP_URL_BUILDER_NAME,
                        HttpUrl.class,
                        clientOptionsMember.name,
                        clientOptions.environment(),
                        getEnvironmentToUrlMethod().name)
                .indent();
        addPathToHttpUrl(httpUrlBuilder);
        httpUrlBuilder.add(";");

        for (EnrichedObjectProperty queryParam : generatedWrappedRequest.queryParams()) {
            if (typeNameIsOptional(queryParam.poetTypeName())) {
                httpUrlBuilder
                        .beginControlFlow("if ($L.$N().isPresent())", requestParameterName, queryParam.getterProperty())
                        .addStatement(
                                "$L.addQueryParameter($S, $L)",
                                AbstractEndpointWriter.HTTP_URL_BUILDER_NAME,
                                queryParam.wireKey().get(),
                                stringify(
                                        CodeBlock.of("$L.$N().get()", "request", queryParam.getterProperty())
                                                .toString(),
                                        queryParam.poetTypeName()))
                        .endControlFlow();
            } else {
                httpUrlBuilder.addStatement(
                        "$L.addQueryParameter($S, $L)",
                        AbstractEndpointWriter.HTTP_URL_BUILDER_NAME,
                        queryParam.wireKey().get(),
                        stringify(
                                CodeBlock.of("$L.$N()", "request", queryParam.getterProperty())
                                        .toString(),
                                queryParam.poetTypeName()));
            }
        }
        httpUrlBuilder.addStatement(
                "$T $L = $L.build()\n",
                HttpUrl.class,
                AbstractEndpointWriter.HTTP_URL_NAME,
                AbstractEndpointWriter.HTTP_URL_BUILDER_NAME);
        return httpUrlBuilder.build();
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper) {
        CodeBlock.Builder requestInitializerBuilder = CodeBlock.builder();
        if (generatedWrappedRequest.requestBodyGetter().isPresent()) {
            String requestBodyArgument = "";
            if (generatedWrappedRequest.requestBodyGetter().get() instanceof ReferencedRequestBodyGetter) {
                requestBodyArgument = requestParameterName + "."
                        + ((ReferencedRequestBodyGetter) generatedWrappedRequest
                                        .requestBodyGetter()
                                        .get())
                                .requestBodyGetter()
                                .name;
            } else if (generatedWrappedRequest.requestBodyGetter().get() instanceof InlinedRequestBodyGetters) {
                requestInitializerBuilder.addStatement(
                        "$T $L = new $T<>()",
                        ParameterizedTypeName.get(Map.class, String.class, Object.class),
                        REQUEST_BODY_PROPERTIES_NAME,
                        HashMap.class);
                InlinedRequestBodyGetters inlinedRequestBodyGetter = ((InlinedRequestBodyGetters)
                        generatedWrappedRequest.requestBodyGetter().get());
                for (EnrichedObjectProperty bodyProperty : inlinedRequestBodyGetter.properties()) {
                    requestInitializerBuilder.addStatement(
                            "$L.put($S, $L)",
                            REQUEST_BODY_PROPERTIES_NAME,
                            bodyProperty.wireKey().get(),
                            requestParameterName + "." + bodyProperty.getterProperty().name + "()");
                }
                requestBodyArgument = REQUEST_BODY_PROPERTIES_NAME;
            }
            requestInitializerBuilder
                    .addStatement("$T $L", RequestBody.class, AbstractEndpointWriter.REQUEST_BODY_NAME)
                    .beginControlFlow("try")
                    .addStatement(
                            "$L = $T.create($T.$L.writeValueAsBytes($L), $T.parse($S))",
                            AbstractEndpointWriter.REQUEST_BODY_NAME,
                            RequestBody.class,
                            generatedObjectMapper.getClassName(),
                            generatedObjectMapper.jsonMapperStaticField().name,
                            requestBodyArgument,
                            okhttp3.MediaType.class,
                            "application/json")
                    .endControlFlow()
                    .beginControlFlow("catch($T e)", Exception.class)
                    .addStatement("throw new $T(e)", RuntimeException.class)
                    .endControlFlow();
        } else {
            requestInitializerBuilder.addStatement(
                    "$T $L = null", RequestBody.class, AbstractEndpointWriter.REQUEST_BODY_NAME);
        }
        requestInitializerBuilder
                .add(
                        "$T.Builder $L = new $T.Builder()\n",
                        Request.class,
                        AbstractEndpointWriter.REQUEST_BUILDER_NAME,
                        Request.class)
                .indent()
                .add(".url($L)\n", AbstractEndpointWriter.HTTP_URL_NAME)
                .add(".method($S, $L)\n", httpEndpoint.getMethod().toString(), AbstractEndpointWriter.REQUEST_BODY_NAME)
                .add(".headers($T.of($L.$N()));\n", Headers.class, clientOptionsMember.name, clientOptions.headers())
                .unindent();
        for (EnrichedObjectProperty header : generatedWrappedRequest.headerParams()) {
            if (typeNameIsOptional(header.poetTypeName())) {
                requestInitializerBuilder
                        .beginControlFlow("if ($L.$N().isPresent())", requestParameterName, header.getterProperty())
                        .addStatement(
                                "$L.addHeader($S, $L.$N().get())",
                                AbstractEndpointWriter.REQUEST_BUILDER_NAME,
                                header.wireKey().get(),
                                "request",
                                header.getterProperty())
                        .endControlFlow();
            } else {
                requestInitializerBuilder.addStatement(
                        "$L.addHeader($S, $L.$N())",
                        AbstractEndpointWriter.REQUEST_BUILDER_NAME,
                        header.wireKey().get(),
                        sdkRequest.getRequestParameterName().getCamelCase().getSafeName(),
                        header.getterProperty());
            }
        }
        requestInitializerBuilder.addStatement("$T $L = $L.build()", Request.class, REQUEST_NAME, REQUEST_BUILDER_NAME);
        return requestInitializerBuilder.build();
    }

    private static boolean typeNameIsOptional(TypeName typeName) {
        return typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class));
    }
}
