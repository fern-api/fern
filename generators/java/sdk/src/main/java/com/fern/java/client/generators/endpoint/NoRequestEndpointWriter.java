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

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpMethod;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequest;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.generators.ClientOptionsGenerator;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import okhttp3.Headers;
import okhttp3.Request;
import okhttp3.RequestBody;

public final class NoRequestEndpointWriter extends AbstractEndpointWriter {

    public NoRequestEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedClientOptions generatedClientOptions,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        super(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                clientGeneratorContext,
                clientOptionsField,
                generatedClientOptions,
                generatedEnvironmentsClass,
                generatedErrors);
    }

    @Override
    public Optional<SdkRequest> sdkRequest() {
        return Optional.empty();
    }

    @Override
    public List<EnrichedObjectProperty> getQueryParams() {
        return Collections.emptyList();
    }

    @Override
    public List<ParameterSpec> additionalParameters() {
        return Collections.emptyList();
    }

    @Override
    public Optional<ParameterSpec> requestParameterSpec() {
        return Optional.empty();
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder builder = CodeBlock.builder()
                .add("$T $L = new $T.Builder()\n", Request.class, getOkhttpRequestName(), Request.class)
                .indent()
                .add(".url(")
                .add(inlineableHttpUrl)
                .add(")\n");
        if (httpEndpoint.getMethod().equals(HttpMethod.POST)) {
            builder.add(
                    ".method($S, $T.create($S, null))\n",
                    httpEndpoint.getMethod().toString(),
                    RequestBody.class,
                    "");
        } else {
            builder.add(".method($S, null)\n", httpEndpoint.getMethod().toString());
        }
        builder.add(
                ".headers($T.of($L.$L($L)))\n",
                Headers.class,
                clientOptionsMember.name,
                ClientOptionsGenerator.HEADERS_METHOD_NAME,
                REQUEST_OPTIONS_PARAMETER_NAME);
        if (sendContentType) {
            builder.add(
                    ".addHeader($S, $S)\n",
                    AbstractEndpointWriter.CONTENT_TYPE_HEADER,
                    AbstractEndpointWriter.APPLICATION_JSON_HEADER);
        }
        return builder.add(".build();\n").unindent().build();
    }
}
