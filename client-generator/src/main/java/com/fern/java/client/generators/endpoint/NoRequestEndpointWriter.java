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
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.Collections;
import java.util.List;
import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.Request;

public final class NoRequestEndpointWriter extends AbstractEndpointWriter {

    public NoRequestEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedClientOptions generatedClientOptions) {
        super(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                clientGeneratorContext,
                clientOptionsField,
                generatedClientOptions,
                generatedEnvironmentsClass);
    }

    @Override
    public List<ParameterSpec> additionalParameters() {
        return Collections.emptyList();
    }

    @Override
    public CodeBlock getInitializeHttpUrlCodeBlock(
            FieldSpec clientOptionsMember, GeneratedClientOptions clientOptions, List<ParameterSpec> pathParameters) {

        CodeBlock.Builder httpUrlInitBuilder = CodeBlock.builder()
                .add(
                        "$T $L = $T.parse(this.$L.$N().$L()).newBuilder()\n",
                        HttpUrl.class,
                        HTTP_URL_NAME,
                        HttpUrl.class,
                        clientOptionsMember.name,
                        clientOptions.environment(),
                        getEnvironmentToUrlMethod().name)
                .indent();
        addPathToHttpUrl(httpUrlInitBuilder);
        return httpUrlInitBuilder.add(".build();").unindent().build();
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            boolean sendContentType) {
        CodeBlock.Builder builder = CodeBlock.builder()
                .add("$T $L = new $T.Builder()\n", Request.class, AbstractEndpointWriter.REQUEST_NAME, Request.class)
                .indent()
                .add(".url($L)\n", AbstractEndpointWriter.HTTP_URL_NAME)
                .add(".method($S, null)\n", httpEndpoint.getMethod().toString())
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
