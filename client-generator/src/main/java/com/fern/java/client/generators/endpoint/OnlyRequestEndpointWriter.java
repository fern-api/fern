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

import com.fern.irV12.model.http.HttpEndpoint;
import com.fern.irV12.model.http.HttpRequestBodyReference;
import com.fern.irV12.model.http.HttpService;
import com.fern.irV12.model.http.SdkRequest;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import okhttp3.Headers;
import okhttp3.Request;
import okhttp3.RequestBody;

public final class OnlyRequestEndpointWriter extends AbstractEndpointWriter {
    private final ClientGeneratorContext clientGeneratorContext;
    private final HttpEndpoint httpEndpoint;
    private final HttpRequestBodyReference httpRequestBodyReference;
    private final SdkRequest sdkRequest;

    public OnlyRequestEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            HttpRequestBodyReference httpRequestBodyReference,
            SdkRequest sdkRequest) {
        super(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                clientGeneratorContext,
                clientOptionsField,
                generatedClientOptions,
                generatedEnvironmentsClass);
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpEndpoint = httpEndpoint;
        this.httpRequestBodyReference = httpRequestBodyReference;
        this.sdkRequest = sdkRequest;
    }

    @Override
    public Optional<SdkRequest> sdkRequest() {
        return Optional.of(this.sdkRequest);
    }

    @Override
    public List<EnrichedObjectProperty> getQueryParams() {
        return Collections.emptyList();
    }

    @Override
    public List<ParameterSpec> additionalParameters() {
        return List.of(ParameterSpec.builder(
                        clientGeneratorContext
                                .getPoetTypeNameMapper()
                                .convertToTypeName(true, httpRequestBodyReference.getRequestBodyType()),
                        "request")
                .build());
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint endpoint,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder builder = CodeBlock.builder()
                .addStatement("$T $L", RequestBody.class, AbstractEndpointWriter.REQUEST_BODY_NAME)
                .beginControlFlow("try")
                .addStatement(
                        "$L = $T.create($T.$L.writeValueAsBytes($L), $T.parse($S))",
                        AbstractEndpointWriter.REQUEST_BODY_NAME,
                        RequestBody.class,
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        "request",
                        okhttp3.MediaType.class,
                        "application/json")
                .endControlFlow()
                .beginControlFlow("catch($T e)", Exception.class)
                .addStatement("throw new $T(e)", RuntimeException.class)
                .endControlFlow()
                .add("$T $L = new $T.Builder()\n", Request.class, AbstractEndpointWriter.REQUEST_NAME, Request.class)
                .indent()
                .add(".url(")
                .add(inlineableHttpUrl)
                .add(")\n")
                .add(".method($S, $L)\n", httpEndpoint.getMethod().toString(), AbstractEndpointWriter.REQUEST_BODY_NAME)
                .add(".headers($T.of($L.$N()))\n", Headers.class, clientOptionsMember.name, clientOptions.headers());
        if (sendContentType) {
            builder.add(
                    ".addHeader($S, $S)\n",
                    AbstractEndpointWriter.CONTENT_TYPE_HEADER,
                    AbstractEndpointWriter.APPLICATION_JSON_HEADER);
        }
        return builder.add(".build();\n").unindent().build();
    }
}
