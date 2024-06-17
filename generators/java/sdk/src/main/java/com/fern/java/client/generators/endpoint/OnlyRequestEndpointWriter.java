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
import com.fern.ir.model.commons.ErrorId;
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
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ArrayTypeName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import okhttp3.Headers;
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
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpEndpoint = httpEndpoint;
        this.sdkRequestBodyType = null;
        this.generatedWrappedRequest = generatedWrappedRequest;
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
        return List.of(requestParameterSpec().get());
    }

    @Override
    public Optional<ParameterSpec> requestParameterSpec() {
        if (generatedWrappedRequest != null) {
            return Optional.of(ParameterSpec.builder(
                            generatedWrappedRequest.getClassName(),
                            sdkRequest.getRequestParameterName().getCamelCase().getSafeName())
                    .build());
        } else if (sdkRequestBodyType != null) {
            ParameterSpec parameterSpec = sdkRequestBodyType.visit(new SdkRequestBodyType.Visitor<>() {
                @Override
                public ParameterSpec visitTypeReference(HttpRequestBodyReference typeReference) {
                    return ParameterSpec.builder(
                                    clientGeneratorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, typeReference.getRequestBodyType()),
                                    sdkRequest
                                            .getRequestParameterName()
                                            .getCamelCase()
                                            .getSafeName())
                            .build();
                }

                @Override
                public ParameterSpec visitBytes(BytesRequest bytes) {
                    TypeName typeName = ArrayTypeName.of(byte.class);
                    if (bytes.getIsOptional()) {
                        typeName = ParameterizedTypeName.get(ClassName.get(Optional.class), typeName);
                    }
                    return ParameterSpec.builder(
                                    typeName,
                                    sdkRequest
                                            .getRequestParameterName()
                                            .getCamelCase()
                                            .getSafeName())
                            .build();
                }

                @Override
                public ParameterSpec _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Encountered unknown sdk request body type: " + unknownType);
                }
            });
            return Optional.of(parameterSpec);
        } else {
            throw new RuntimeException("Unexpected, both generatedWrappedRequest and sdkRequestBodyType are null");
        }
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint endpoint,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder builder = CodeBlock.builder();

        if (sdkRequestBodyType != null) {
            sdkRequestBodyType.visit(new RequestBodyInitializer(builder, generatedObjectMapper, endpoint));

            builder.add("$T $L = new $T.Builder()\n", Request.class, getOkhttpRequestName(), Request.class)
                    .indent()
                    .add(".url(")
                    .add(inlineableHttpUrl)
                    .add(")\n")
                    .add(".method($S, $L)\n", httpEndpoint.getMethod().toString(), getOkhttpRequestBodyName())
                    .add(
                            ".headers($T.of($L.$L($L)))\n",
                            Headers.class,
                            clientOptionsMember.name,
                            ClientOptionsGenerator.HEADERS_METHOD_NAME,
                            REQUEST_OPTIONS_PARAMETER_NAME);
            if (sendContentType) {
                sdkRequestBodyType.visit(new SdkRequestBodyType.Visitor<Void>() {

                    @Override
                    public Void visitTypeReference(HttpRequestBodyReference typeReference) {
                        builder.add(
                                ".addHeader($S, $S)\n",
                                AbstractEndpointWriter.CONTENT_TYPE_HEADER,
                                AbstractEndpointWriter.APPLICATION_JSON_HEADER);
                        return null;
                    }

                    @Override
                    public Void visitBytes(BytesRequest bytes) {
                        builder.add(
                                ".addHeader($S, $S)\n",
                                AbstractEndpointWriter.CONTENT_TYPE_HEADER,
                                bytes.getContentType().orElse(AbstractEndpointWriter.APPLICATION_OCTET_STREAM));
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
                    .visit(new RequestBodyInitializer(builder, generatedObjectMapper, endpoint));
            builder.add("$T $L = new $T.Builder()\n", Request.class, getOkhttpRequestName(), Request.class)
                    .indent()
                    .add(".url(")
                    .add(inlineableHttpUrl)
                    .add(")\n")
                    .add(".method($S, $L)\n", httpEndpoint.getMethod().toString(), getOkhttpRequestBodyName())
                    .add(
                            ".headers($T.of($L.$L($L)))\n",
                            Headers.class,
                            clientOptionsMember.name,
                            ClientOptionsGenerator.HEADERS_METHOD_NAME,
                            REQUEST_OPTIONS_PARAMETER_NAME);
            builder.add(
                    ".addHeader($S, $S)\n",
                    AbstractEndpointWriter.CONTENT_TYPE_HEADER,
                    AbstractEndpointWriter.APPLICATION_JSON_HEADER);
            return builder.add(".build();\n").unindent().build();
        }
    }

    private final class RequestBodyInitializer implements SdkRequestBodyType.Visitor<Void> {

        private final CodeBlock.Builder codeBlock;
        private final GeneratedObjectMapper generatedObjectMapper;
        private final HttpEndpoint endpoint;

        private RequestBodyInitializer(
                CodeBlock.Builder codeBlock, GeneratedObjectMapper generatedObjectMapper, HttpEndpoint endpoint) {
            this.codeBlock = codeBlock;
            this.generatedObjectMapper = generatedObjectMapper;
            this.endpoint = endpoint;
        }

        @Override
        public Void visitTypeReference(HttpRequestBodyReference _typeReference) {
            boolean isOptional = false;
            if (this.endpoint.getRequestBody().isPresent()) {
                isOptional = HttpRequestBodyIsWrappedInOptional.isOptional(
                        this.endpoint.getRequestBody().get());
            }
            codeBlock
                    .addStatement("$T $L", RequestBody.class, getOkhttpRequestBodyName())
                    .beginControlFlow("try");

            if (isOptional) {
                codeBlock
                        .addStatement("$L = $T.create(\"\", null)", getOkhttpRequestBodyName(), RequestBody.class)
                        .beginControlFlow("if ($N.isPresent())", "request");
            }
            codeBlock
                    .addStatement(
                            "$L = $T.create($T.$L.writeValueAsBytes($L), $T.$L)",
                            getOkhttpRequestBodyName(),
                            RequestBody.class,
                            generatedObjectMapper.getClassName(),
                            generatedObjectMapper.jsonMapperStaticField().name,
                            "request",
                            clientGeneratorContext.getPoetClassNameFactory().getMediaTypesClassName(),
                            CoreMediaTypesGenerator.APPLICATION_JSON_FIELD_CONSTANT)
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
                    "$T $L = $T.create($L)",
                    RequestBody.class,
                    getOkhttpRequestBodyName(),
                    RequestBody.class,
                    sdkRequest.getRequestParameterName().getCamelCase().getSafeName());
            return null;
        }

        @Override
        public Void _visitUnknown(Object unknownType) {
            return null;
        }
    }
}
