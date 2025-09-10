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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequest;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.generators.ClientOptionsGenerator;
import com.fern.java.client.generators.CoreMediaTypesGenerator;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import okhttp3.Headers;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;

public final class OnlyRequestEndpointWriter extends AbstractEndpointWriter {
    private final ClientGeneratorContext clientGeneratorContext;
    private final HttpEndpoint httpEndpoint;
    private final SdkRequestBodyType sdkRequestBodyType;
    private final SdkRequest sdkRequest;
    private final GeneratedWrappedRequest generatedWrappedRequest;

    public OnlyRequestEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            SdkRequestBodyType sdkRequestBodyType,
            SdkRequest sdkRequest,
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
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpEndpoint = httpEndpoint;
        this.sdkRequestBodyType = sdkRequestBodyType;
        this.sdkRequest = sdkRequest;
        this.generatedWrappedRequest = null;
    }

    public OnlyRequestEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedWrappedRequest generatedWrappedRequest,
            SdkRequest sdkRequest,
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
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpEndpoint = httpEndpoint;
        this.sdkRequestBodyType = null;
        this.generatedWrappedRequest = generatedWrappedRequest;
        this.sdkRequest = sdkRequest;
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint endpoint,
            String contentType,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder builder = CodeBlock.builder();

        if (sdkRequestBodyType != null) {
            sdkRequestBodyType.visit(
                    new RequestBodyInitializer(builder, generatedObjectMapper, endpoint, sendContentType, contentType));

            builder.add("$T $L = new $T.Builder()\n", Request.class, variables.getOkhttpRequestName(), Request.class)
                    .indent()
                    .add(".url(")
                    .add(inlineableHttpUrl)
                    .add(")\n")
                    .add(".method($S, $L)\n", httpEndpoint.getMethod().toString(), variables.getOkhttpRequestBodyName())
                    .add(
                            ".headers($T.of($L.$L($L)))\n",
                            Headers.class,
                            clientOptionsMember.name,
                            ClientOptionsGenerator.HEADERS_METHOD_NAME,
                            AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME);
            if (sendContentType) {
                sdkRequestBodyType.visit(new SdkRequestBodyType.Visitor<Void>() {

                    @Override
                    public Void visitTypeReference(HttpRequestBodyReference typeReference) {
                        builder.add(".addHeader($S, $S)\n", AbstractEndpointWriter.CONTENT_TYPE_HEADER, contentType);
                        AbstractEndpointWriter.maybeAcceptsHeader(httpEndpoint)
                                .ifPresent(acceptsHeader ->
                                        builder.add(acceptsHeader).add("\n"));
                        return null;
                    }

                    @Override
                    public Void visitBytes(BytesRequest bytes) {
                        return null;
                    }

                    @Override
                    public Void _visitUnknown(Object unknownType) {
                        return null;
                    }
                });
            }
            return builder.add(".build();\n").unindent().build();
        } else {
            SdkRequestBodyType.typeReference(HttpRequestBodyReference.builder()
                            .requestBodyType(TypeReference.unknown())
                            .build())
                    .visit(new RequestBodyInitializer(
                            builder, generatedObjectMapper, endpoint, sendContentType, contentType));
            builder.add("$T $L = new $T.Builder()\n", Request.class, variables.getOkhttpRequestName(), Request.class)
                    .indent()
                    .add(".url(")
                    .add(inlineableHttpUrl)
                    .add(")\n")
                    .add(".method($S, $L)\n", httpEndpoint.getMethod().toString(), variables.getOkhttpRequestBodyName())
                    .add(
                            ".headers($T.of($L.$L($L)))\n",
                            Headers.class,
                            clientOptionsMember.name,
                            ClientOptionsGenerator.HEADERS_METHOD_NAME,
                            AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME);
            if (sendContentType) {
                builder.add(".addHeader($S, $S)\n", AbstractEndpointWriter.CONTENT_TYPE_HEADER, contentType);
            }
            AbstractEndpointWriter.maybeAcceptsHeader(httpEndpoint)
                    .ifPresent(acceptsHeader -> builder.add(acceptsHeader).add("\n"));
            return builder.add(".build();\n").unindent().build();
        }
    }

    private final class RequestBodyInitializer implements SdkRequestBodyType.Visitor<Void> {

        private final CodeBlock.Builder codeBlock;
        private final GeneratedObjectMapper generatedObjectMapper;
        private final HttpEndpoint endpoint;
        private final boolean sendContentType;
        private final String contentType;

        private RequestBodyInitializer(
                CodeBlock.Builder codeBlock,
                GeneratedObjectMapper generatedObjectMapper,
                HttpEndpoint endpoint,
                boolean sendContentType,
                String contentType) {
            this.codeBlock = codeBlock;
            this.generatedObjectMapper = generatedObjectMapper;
            this.endpoint = endpoint;
            this.sendContentType = sendContentType;
            this.contentType = contentType;
        }

        @Override
        public Void visitTypeReference(HttpRequestBodyReference _typeReference) {
            boolean isOptional = false;
            if (this.endpoint.getRequestBody().isPresent()) {
                isOptional = HttpRequestBodyIsWrappedInOptional.isOptional(
                        this.endpoint.getRequestBody().get());
            }
            codeBlock
                    .addStatement("$T $L", RequestBody.class, variables.getOkhttpRequestBodyName())
                    .beginControlFlow("try");

            if (isOptional) {
                codeBlock
                        .addStatement(
                                "$L = $T.create(\"\", null)", variables.getOkhttpRequestBodyName(), RequestBody.class)
                        .beginControlFlow("if ($N.isPresent())", "request");
            }

            CodeBlock requestBodyGetter = CodeBlock.of("request");

            boolean requestBodyGetterPresent = generatedWrappedRequest != null
                    && generatedWrappedRequest.requestBodyGetter().isPresent();

            if (clientGeneratorContext.getCustomConfig().inlinePathParameters()
                    && requestBodyGetterPresent
                    && (generatedWrappedRequest.requestBodyGetter().get()
                            instanceof GeneratedWrappedRequest.ReferencedRequestBodyGetter)) {
                String getterName = ((GeneratedWrappedRequest.ReferencedRequestBodyGetter)
                                generatedWrappedRequest.requestBodyGetter().get())
                        .requestBodyGetter()
                        .name;

                requestBodyGetter = CodeBlock.of("request.$L()", getterName);
            }

            CodeBlock requestBodyContentType = CodeBlock.of(
                    "$T.$L",
                    clientGeneratorContext.getPoetClassNameFactory().getMediaTypesClassName(),
                    CoreMediaTypesGenerator.APPLICATION_JSON_FIELD_CONSTANT);

            if (sendContentType && !contentType.equals(AbstractEndpointWriter.APPLICATION_JSON_HEADER)) {
                requestBodyContentType = CodeBlock.of("$T.parse($S)", MediaType.class, contentType);
            }

            codeBlock
                    .addStatement(
                            "$L = $T.create($T.$L.writeValueAsBytes($L), $L)",
                            variables.getOkhttpRequestBodyName(),
                            RequestBody.class,
                            generatedObjectMapper.getClassName(),
                            generatedObjectMapper.jsonMapperStaticField().name,
                            requestBodyGetter,
                            requestBodyContentType)
                    .endControlFlow();
            if (isOptional) {
                codeBlock.endControlFlow();
            }
            codeBlock
                    .beginControlFlow("catch($T e)", JsonProcessingException.class)
                    .addStatement("throw new $T($S, e)", baseErrorClassName, "Failed to serialize request")
                    .endControlFlow();
            return null;
        }

        @Override
        public Void visitBytes(BytesRequest bytes) {
            codeBlock.addStatement(
                    "$T $L = new $T($T.parse($S), $L)",
                    RequestBody.class,
                    variables.getOkhttpRequestBodyName(),
                    clientGeneratorContext.getPoetClassNameFactory().getInputStreamRequestBodyClassName(),
                    MediaType.class,
                    bytes.getContentType().orElse(APPLICATION_OCTET_STREAM),
                    sdkRequest.getRequestParameterName().getCamelCase().getSafeName());
            return null;
        }

        @Override
        public Void _visitUnknown(Object unknownType) {
            return null;
        }
    }
}
