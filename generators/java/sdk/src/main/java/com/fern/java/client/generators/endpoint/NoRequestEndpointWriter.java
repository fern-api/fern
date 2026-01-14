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

import com.fern.ir.model.http.*;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.generators.ClientOptionsGenerator;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
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
            AbstractHttpResponseParserGenerator responseParserGenerator,
            HttpEndpointMethodSpecsFactory httpEndpointMethodSpecsFactory,
            AbstractEndpointWriterVariableNameContext variables,
            ClassName apiErrorClassName,
            ClassName baseErrorClassName) {
        super(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                clientGeneratorContext,
                clientOptionsField,
                generatedClientOptions,
                generatedEnvironmentsClass,
                responseParserGenerator,
                httpEndpointMethodSpecsFactory,
                variables,
                apiErrorClassName,
                baseErrorClassName);
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint httpEndpoint,
            String contentType,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder builder = CodeBlock.builder();

        if (clientGeneratorContext.isEndpointSecurity()) {
            builder.add("$T<String, String> _headers = new $T<>($L.$L($L));\n",
                    java.util.Map.class,
                    java.util.HashMap.class,
                    clientOptionsMember.name,
                    ClientOptionsGenerator.HEADERS_METHOD_NAME,
                    AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME);
            builder.add("_headers.putAll($L.$L($L));\n",
                    clientOptionsMember.name,
                    ClientOptionsGenerator.AUTH_HEADERS_METHOD_NAME,
                    getEndpointMetadataCodeBlock(httpEndpoint));
        }

        builder.add("$T $L = new $T.Builder()\n", Request.class, variables.getOkhttpRequestName(), Request.class)
                .indent()
                .add(".url(")
                .add(inlineableHttpUrl)
                .add(")\n");
        if (httpEndpoint.getMethod().equals(HttpMethod.POST)
                || httpEndpoint.getMethod().equals(HttpMethod.PUT)) {
            builder.add(
                    ".method($S, $T.create($S, null))\n",
                    httpEndpoint.getMethod().toString(),
                    RequestBody.class,
                    "");
        } else {
            builder.add(".method($S, null)\n", httpEndpoint.getMethod().toString());
        }

        if (clientGeneratorContext.isEndpointSecurity()) {
            builder.add(".headers($T.of(_headers))\n", Headers.class);
        } else {
            builder.add(
                    ".headers($T.of($L.$L($L)))\n",
                    Headers.class,
                    clientOptionsMember.name,
                    ClientOptionsGenerator.HEADERS_METHOD_NAME,
                    AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME);
        }
        if (sendContentType) {
            builder.add(".addHeader($S, $S)\n", AbstractEndpointWriter.CONTENT_TYPE_HEADER, contentType);
        }
        AbstractEndpointWriter.maybeAcceptsHeader(httpEndpoint)
                .ifPresent(acceptsHeader -> builder.add(acceptsHeader).add("\n"));
        return builder.add(".build();\n").unindent().build();
    }
}
