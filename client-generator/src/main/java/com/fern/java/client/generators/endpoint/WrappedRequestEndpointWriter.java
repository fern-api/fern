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

import com.fern.irV20.model.http.FileProperty;
import com.fern.irV20.model.http.HttpEndpoint;
import com.fern.irV20.model.http.HttpMethod;
import com.fern.irV20.model.http.HttpService;
import com.fern.irV20.model.http.SdkRequest;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.GeneratedWrappedRequest.FilePropertyContainer;
import com.fern.java.client.GeneratedWrappedRequest.FileUploadProperty;
import com.fern.java.client.GeneratedWrappedRequest.FileUploadRequestBodyGetters;
import com.fern.java.client.GeneratedWrappedRequest.InlinedRequestBodyGetters;
import com.fern.java.client.GeneratedWrappedRequest.JsonFileUploadProperty;
import com.fern.java.client.GeneratedWrappedRequest.ReferencedRequestBodyGetter;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import okhttp3.Headers;
import okhttp3.MultipartBody;
import okhttp3.Request;
import okhttp3.RequestBody;

public final class WrappedRequestEndpointWriter extends AbstractEndpointWriter {

    public static final String REQUEST_BODY_PROPERTIES_NAME = "_requestBodyProperties";

    public static final String MULTIPART_BODY_PROPERTIES_NAME = "_multipartBody";

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
            GeneratedWrappedRequest generatedWrappedRequest,
            GeneratedJavaFile requestOptionsFile) {
        super(
                httpService,
                httpEndpoint,
                generatedObjectMapper,
                clientGeneratorContext,
                clientOptionsField,
                generatedClientOptions,
                generatedEnvironmentsClass,
                requestOptionsFile);
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedWrappedRequest = generatedWrappedRequest;
        this.sdkRequest = sdkRequest;
        this.requestParameterName =
                sdkRequest.getRequestParameterName().getCamelCase().getSafeName();
    }

    @Override
    public Optional<SdkRequest> sdkRequest() {
        return Optional.of(this.sdkRequest);
    }

    @Override
    public List<EnrichedObjectProperty> getQueryParams() {
        return generatedWrappedRequest.queryParams();
    }

    @Override
    public List<ParameterSpec> additionalParameters() {
        List<ParameterSpec> parameterSpecs = new ArrayList<>();
        if (generatedWrappedRequest.requestBodyGetter().isPresent()
                && generatedWrappedRequest.requestBodyGetter().get() instanceof FileUploadRequestBodyGetters) {
            FileUploadRequestBodyGetters fileUploadRequest = (FileUploadRequestBodyGetters)
                    (generatedWrappedRequest.requestBodyGetter().get());
            fileUploadRequest.fileProperties().forEach(fileProperty -> {
                ParameterSpec fileParameter = ParameterSpec.builder(
                                fileProperty.getIsOptional()
                                        ? ParameterizedTypeName.get(Optional.class, File.class)
                                        : ClassName.get(File.class),
                                getFilePropertyParameterName(fileProperty))
                        .build();
                parameterSpecs.add(fileParameter);
            });
        }
        parameterSpecs.add(ParameterSpec.builder(generatedWrappedRequest.getClassName(), requestParameterName)
                .build());
        return parameterSpecs;
    }

    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder requestBodyCodeBlock = CodeBlock.builder();
        boolean isFileUpload = generatedWrappedRequest.requestBodyGetter().isPresent()
                && generatedWrappedRequest.requestBodyGetter().get() instanceof FileUploadRequestBodyGetters;
        if (generatedWrappedRequest.requestBodyGetter().isPresent()) {
            if (generatedWrappedRequest.requestBodyGetter().get() instanceof ReferencedRequestBodyGetter) {
                String jsonRequestBodyArgument = requestParameterName + "."
                        + ((ReferencedRequestBodyGetter) generatedWrappedRequest
                                        .requestBodyGetter()
                                        .get())
                                .requestBodyGetter()
                                .name
                        + "()";
                initializeRequestBody(generatedObjectMapper, jsonRequestBodyArgument, requestBodyCodeBlock);
            } else if (generatedWrappedRequest.requestBodyGetter().get() instanceof InlinedRequestBodyGetters) {
                InlinedRequestBodyGetters inlinedRequestBodyGetter = ((InlinedRequestBodyGetters)
                        generatedWrappedRequest.requestBodyGetter().get());
                initializeRequestBodyProperties(inlinedRequestBodyGetter, requestBodyCodeBlock);
                initializeRequestBody(generatedObjectMapper, REQUEST_BODY_PROPERTIES_NAME, requestBodyCodeBlock);
            } else if (generatedWrappedRequest.requestBodyGetter().get() instanceof FileUploadRequestBodyGetters) {
                FileUploadRequestBodyGetters fileUploadRequestBodyGetter = ((FileUploadRequestBodyGetters)
                        generatedWrappedRequest.requestBodyGetter().get());
                initializeMultipartBody(fileUploadRequestBodyGetter, requestBodyCodeBlock);
                requestBodyCodeBlock.addStatement(
                        "$T $L = $L.build()",
                        RequestBody.class,
                        AbstractEndpointWriter.REQUEST_BODY_NAME,
                        MULTIPART_BODY_PROPERTIES_NAME);
            }
        } else {
            if (httpEndpoint.getMethod().equals(HttpMethod.POST)) {
                requestBodyCodeBlock.addStatement(
                        "$T $L = $T.create($S, null)",
                        RequestBody.class,
                        AbstractEndpointWriter.REQUEST_BODY_NAME,
                        RequestBody.class,
                        "");
            } else {
                requestBodyCodeBlock.addStatement(
                        "$T $L = null", RequestBody.class, AbstractEndpointWriter.REQUEST_BODY_NAME);
            }
        }
        requestBodyCodeBlock
                .add(
                        "$T.Builder $L = new $T.Builder()\n",
                        Request.class,
                        AbstractEndpointWriter.REQUEST_BUILDER_NAME,
                        Request.class)
                .indent()
                .add(".url(")
                .add(inlineableHttpUrl)
                .add(")\n")
                .add(
                        ".method($S, $L)\n",
                        httpEndpoint.getMethod().toString(),
                        AbstractEndpointWriter.REQUEST_BODY_NAME);
        if (sendContentType && !isFileUpload) {
            requestBodyCodeBlock
                    .add(
                            ".headers($T.of($L.$N($L)))\n",
                            Headers.class,
                            clientOptionsMember.name,
                            clientOptions.headers(),
                            AbstractEndpointWriter.REQUEST_OPTIONS_PARAMETER_NAME)
                    .add(
                            ".addHeader($S, $S);\n",
                            AbstractEndpointWriter.CONTENT_TYPE_HEADER,
                            AbstractEndpointWriter.APPLICATION_JSON_HEADER);
        } else {
            requestBodyCodeBlock.add(
                    ".headers($T.of($L.$N($L)));\n",
                    Headers.class,
                    clientOptionsMember.name,
                    clientOptions.headers(),
                    AbstractEndpointWriter.REQUEST_OPTIONS_PARAMETER_NAME);
        }
        requestBodyCodeBlock.unindent();
        for (EnrichedObjectProperty header : generatedWrappedRequest.headerParams()) {
            if (typeNameIsOptional(header.poetTypeName())) {
                requestBodyCodeBlock
                        .beginControlFlow("if ($L.$N().isPresent())", requestParameterName, header.getterProperty())
                        .addStatement(
                                "$L.addHeader($S, $L)",
                                AbstractEndpointWriter.REQUEST_BUILDER_NAME,
                                header.wireKey().get(),
                                PoetTypeNameStringifier.stringify(
                                        CodeBlock.of("$L.$N().get()", "request", header.getterProperty())
                                                .toString(),
                                        header.poetTypeName()))
                        .endControlFlow();
            } else {
                requestBodyCodeBlock.addStatement(
                        "$L.addHeader($S, $L)",
                        AbstractEndpointWriter.REQUEST_BUILDER_NAME,
                        header.wireKey().get(),
                        PoetTypeNameStringifier.stringify(
                                CodeBlock.of("$L.$N()", "request", header.getterProperty())
                                        .toString(),
                                header.poetTypeName()));
            }
        }
        requestBodyCodeBlock.addStatement("$T $L = $L.build()", Request.class, REQUEST_NAME, REQUEST_BUILDER_NAME);
        return requestBodyCodeBlock.build();
    }

    private void initializeRequestBodyProperties(
            InlinedRequestBodyGetters inlinedRequestBody, CodeBlock.Builder requestBodyCodeBlock) {
        requestBodyCodeBlock.addStatement(
                "$T $L = new $T<>()",
                ParameterizedTypeName.get(Map.class, String.class, Object.class),
                REQUEST_BODY_PROPERTIES_NAME,
                HashMap.class);
        for (EnrichedObjectProperty bodyProperty : inlinedRequestBody.properties()) {
            if (typeNameIsOptional(bodyProperty.poetTypeName())) {
                requestBodyCodeBlock
                        .beginControlFlow(
                                "if ($L.$N().isPresent())", requestParameterName, bodyProperty.getterProperty())
                        .addStatement(
                                "$L.put($S, $L)",
                                REQUEST_BODY_PROPERTIES_NAME,
                                bodyProperty.wireKey().get(),
                                requestParameterName + "." + bodyProperty.getterProperty().name + "()")
                        .endControlFlow();
            } else {
                requestBodyCodeBlock.addStatement(
                        "$L.put($S, $L)",
                        REQUEST_BODY_PROPERTIES_NAME,
                        bodyProperty.wireKey().get(),
                        requestParameterName + "." + bodyProperty.getterProperty().name + "()");
            }
        }
    }

    private void initializeRequestBody(
            GeneratedObjectMapper generatedObjectMapper,
            String variableToJsonify,
            CodeBlock.Builder requestBodyCodeBlock) {
        requestBodyCodeBlock
                .addStatement("$T $L", RequestBody.class, AbstractEndpointWriter.REQUEST_BODY_NAME)
                .beginControlFlow("try")
                .addStatement(
                        "$L = $T.create($T.$L.writeValueAsBytes($L), $T.parse($S))",
                        AbstractEndpointWriter.REQUEST_BODY_NAME,
                        RequestBody.class,
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        variableToJsonify,
                        okhttp3.MediaType.class,
                        "application/json")
                .endControlFlow()
                .beginControlFlow("catch($T e)", Exception.class)
                .addStatement("throw new $T(e)", RuntimeException.class)
                .endControlFlow();
    }

    private void initializeMultipartBody(
            FileUploadRequestBodyGetters fileUploadRequest, CodeBlock.Builder requestBodyCodeBlock) {
        requestBodyCodeBlock.addStatement(
                "$T.Builder $L = new $T.Builder().setType($T.FORM)",
                MultipartBody.class,
                MULTIPART_BODY_PROPERTIES_NAME,
                MultipartBody.class,
                MultipartBody.class);
        for (FileUploadProperty fileUploadProperty : fileUploadRequest.properties()) {
            if (fileUploadProperty instanceof JsonFileUploadProperty) {
                EnrichedObjectProperty jsonProperty = ((JsonFileUploadProperty) fileUploadProperty).objectProperty();
                if (typeNameIsOptional(jsonProperty.poetTypeName())) {
                    requestBodyCodeBlock
                            .beginControlFlow(
                                    "if ($L.$N().isPresent())", requestParameterName, jsonProperty.getterProperty())
                            .addStatement(
                                    "$L.addFormDataPart($S, $L)",
                                    MULTIPART_BODY_PROPERTIES_NAME,
                                    jsonProperty.wireKey().get(),
                                    requestParameterName + "." + jsonProperty.getterProperty().name + "()")
                            .endControlFlow();
                } else {
                    requestBodyCodeBlock.addStatement(
                            "$L.addFormDataPart($S, $L)",
                            MULTIPART_BODY_PROPERTIES_NAME,
                            jsonProperty.wireKey().get(),
                            requestParameterName + "." + jsonProperty.getterProperty().name + "()");
                }
            } else if (fileUploadProperty instanceof FilePropertyContainer) {
                FileProperty fileProperty = ((FilePropertyContainer) fileUploadProperty).fileProperty();
                if (fileProperty.getIsOptional()) {
                    requestBodyCodeBlock
                            .beginControlFlow(
                                    "if ($L.$N().isPresent())",
                                    requestParameterName,
                                    getFilePropertyParameterName(fileProperty))
                            .addStatement(
                                    "$L.addFormDataPart($S, null, $T.create(null, $L))",
                                    MULTIPART_BODY_PROPERTIES_NAME,
                                    fileProperty.getKey().getWireValue(),
                                    RequestBody.class,
                                    getFilePropertyParameterName(fileProperty))
                            .endControlFlow();
                } else {
                    requestBodyCodeBlock.addStatement(
                            "$L.addFormDataPart($S, null, $T.create(null, $L))",
                            MULTIPART_BODY_PROPERTIES_NAME,
                            fileProperty.getKey().getWireValue(),
                            RequestBody.class,
                            getFilePropertyParameterName(fileProperty));
                }
            }
        }
    }

    private static boolean typeNameIsOptional(TypeName typeName) {
        return typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class));
    }

    private static String getFilePropertyParameterName(FileProperty fileProperty) {
        return fileProperty.getKey().getName().getCamelCase().getSafeName();
    }
}
