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

import com.fern.ir.v9.model.http.HttpEndpoint;
import com.fern.ir.v9.model.http.HttpRequestBodyReference;
import com.fern.ir.v9.model.http.HttpService;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.List;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.Request;
import okhttp3.RequestBody;

public final class OnlyRequestEndpointWriter extends AbstractEndpointWriter {
    private final ClientGeneratorContext clientGeneratorContext;
    private final HttpEndpoint httpEndpoint;
    private final HttpRequestBodyReference httpRequestBodyReference;

    public OnlyRequestEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            HttpRequestBodyReference httpRequestBodyReference) {
        super(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                clientGeneratorContext,
                clientOptionsField,
                generatedClientOptions);
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpEndpoint = httpEndpoint;
        this.httpRequestBodyReference = httpRequestBodyReference;
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
    public CodeBlock getInitializeHttpUrlCodeBlock(
            FieldSpec clientOptionsMember, GeneratedClientOptions clientOptions, List<ParameterSpec> pathParameters) {
        CodeBlock.Builder httpUrlInitBuilder = CodeBlock.builder()
                .add(
                        "$T $L = $T.parse(this.$L.$N()).newBuilder()\n",
                        HttpUrl.class,
                        HTTP_URL_NAME,
                        HttpUrl.class,
                        clientOptionsMember.name,
                        clientOptions.url())
                .indent();
        for (ParameterSpec pathParameter : pathParameters) {
            httpUrlInitBuilder.add(".addPathSegment($L)\n", pathParameter.name);
        }
        return httpUrlInitBuilder.add(".build();\n").unindent().build();
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint endpoint,
            GeneratedObjectMapper generatedObjectMapper) {
        return CodeBlock.builder()
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
                .add(".url($L)\n", AbstractEndpointWriter.HTTP_URL_NAME)
                .add(".method($S, $L)\n", httpEndpoint.getMethod().toString(), AbstractEndpointWriter.REQUEST_BODY_NAME)
                .add(".headers($T.of($L.$N()))\n", Headers.class, clientOptionsMember.name, clientOptions.headers())
                .add(".build();\n")
                .unindent()
                .build();
    }
}
