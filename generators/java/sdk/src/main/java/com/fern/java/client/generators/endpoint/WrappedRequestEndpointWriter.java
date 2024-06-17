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
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.http.FileProperty;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpMethod;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequest;
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
import com.fern.java.client.generators.ClientOptionsGenerator;
import com.fern.java.client.generators.CoreMediaTypesGenerator;
import com.fern.java.client.generators.visitors.FilePropertyIsOptional;
import com.fern.java.client.generators.visitors.GetFilePropertyKey;
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
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import okhttp3.Headers;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.Request;
import okhttp3.RequestBody;

public final class WrappedRequestEndpointWriter extends AbstractEndpointWriter {

    private final HttpEndpoint httpEndpoint;
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
        this.httpEndpoint = httpEndpoint;
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
                                fileProperty.visit(new FilePropertyIsOptional())
                                        ? ParameterizedTypeName.get(Optional.class, File.class)
                                        : ClassName.get(File.class),
                                getFilePropertyParameterName(fileProperty))
                        .build();
                parameterSpecs.add(fileParameter);
            });
        }
        parameterSpecs.add(requestParameterSpec().get());
        return parameterSpecs;
    }

    @Override
    public Optional<ParameterSpec> requestParameterSpec() {
        return Optional.of(ParameterSpec.builder(generatedWrappedRequest.getClassName(), requestParameterName)
                .build());
    }

    @SuppressWarnings("checkstyle:CyclomaticComplexity")
    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint _unused,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder requestBodyCodeBlock = CodeBlock.builder();
        boolean isFileUpload = generatedWrappedRequest.requestBodyGetter().isPresent()
                && generatedWrappedRequest.requestBodyGetter().get() instanceof FileUploadRequestBodyGetters;
        Optional<CodeBlock> inlinedRequestBodyBuilder = Optional.empty();
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
                initializeRequestBody(generatedObjectMapper, getRequestBodyPropertiesName(), requestBodyCodeBlock);
            } else if (generatedWrappedRequest.requestBodyGetter().get() instanceof FileUploadRequestBodyGetters) {
                FileUploadRequestBodyGetters fileUploadRequestBodyGetter = ((FileUploadRequestBodyGetters)
                        generatedWrappedRequest.requestBodyGetter().get());
                initializeMultipartBody(fileUploadRequestBodyGetter, requestBodyCodeBlock, generatedObjectMapper);
                inlinedRequestBodyBuilder = Optional.of(CodeBlock.of("$L.build()", getOkhttpRequestBodyName()));
            }
        } else {
            if (httpEndpoint.getMethod().equals(HttpMethod.POST)) {
                inlinedRequestBodyBuilder = Optional.of(CodeBlock.of("$T.create($S, null)", RequestBody.class, ""));
            } else {
                inlinedRequestBodyBuilder = Optional.of(CodeBlock.of("null"));
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
                .add(")\n");
        if (inlinedRequestBodyBuilder.isPresent()) {
            requestBodyCodeBlock
                    .add(".method($S, ", httpEndpoint.getMethod().toString())
                    .add(inlinedRequestBodyBuilder.get())
                    .add(")\n");
        } else {
            requestBodyCodeBlock.add(
                    ".method($S, $L)\n", httpEndpoint.getMethod().toString(), getOkhttpRequestBodyName());
        }
        if (sendContentType && !isFileUpload) {
            requestBodyCodeBlock
                    .add(
                            ".headers($T.of($L.$L($L)))\n",
                            Headers.class,
                            clientOptionsMember.name,
                            ClientOptionsGenerator.HEADERS_METHOD_NAME,
                            AbstractEndpointWriter.REQUEST_OPTIONS_PARAMETER_NAME)
                    .add(
                            ".addHeader($S, $S);\n",
                            AbstractEndpointWriter.CONTENT_TYPE_HEADER,
                            AbstractEndpointWriter.APPLICATION_JSON_HEADER);
        } else {
            requestBodyCodeBlock.add(
                    ".headers($T.of($L.$L($L)));\n",
                    Headers.class,
                    clientOptionsMember.name,
                    ClientOptionsGenerator.HEADERS_METHOD_NAME,
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
        requestBodyCodeBlock.addStatement(
                "$T $L = $L.build()", Request.class, getOkhttpRequestName(), REQUEST_BUILDER_NAME);
        return requestBodyCodeBlock.build();
    }

    private void initializeRequestBodyProperties(
            InlinedRequestBodyGetters inlinedRequestBody, CodeBlock.Builder requestBodyCodeBlock) {
        requestBodyCodeBlock.addStatement(
                "$T $L = new $T<>()",
                ParameterizedTypeName.get(Map.class, String.class, Object.class),
                getRequestBodyPropertiesName(),
                HashMap.class);
        for (EnrichedObjectProperty bodyProperty : inlinedRequestBody.properties()) {
            if (typeNameIsOptional(bodyProperty.poetTypeName())) {
                requestBodyCodeBlock
                        .beginControlFlow(
                                "if ($L.$N().isPresent())", requestParameterName, bodyProperty.getterProperty())
                        .addStatement(
                                "$L.put($S, $L)",
                                getRequestBodyPropertiesName(),
                                bodyProperty.wireKey().get(),
                                requestParameterName + "." + bodyProperty.getterProperty().name + "()")
                        .endControlFlow();
            } else {
                requestBodyCodeBlock.addStatement(
                        "$L.put($S, $L)",
                        getRequestBodyPropertiesName(),
                        bodyProperty.wireKey().get(),
                        requestParameterName + "." + bodyProperty.getterProperty().name + "()");
            }
        }
    }

    private void initializeRequestBody(
            GeneratedObjectMapper generatedObjectMapper,
            String variableToJsonify,
            CodeBlock.Builder requestBodyCodeBlock) {
        boolean isOptional = false;
        if (this.httpEndpoint.getRequestBody().isPresent()) {
            isOptional = HttpRequestBodyIsWrappedInOptional.isOptional(
                    this.httpEndpoint.getRequestBody().get());
        }

        requestBodyCodeBlock
                .addStatement("$T $L", RequestBody.class, getOkhttpRequestBodyName())
                .beginControlFlow("try");
        if (isOptional) {
            // Set a default empty response body and begin a conditional, prior to parsing the RequestBody
            requestBodyCodeBlock
                    .addStatement("$L = $T.create(\"\", null)", getOkhttpRequestBodyName(), RequestBody.class)
                    .beginControlFlow("if ($N.isPresent())", variableToJsonify);
        }
        requestBodyCodeBlock
                .addStatement(
                        "$L = $T.create($T.$L.writeValueAsBytes($L), $T.$L)",
                        getOkhttpRequestBodyName(),
                        RequestBody.class,
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        variableToJsonify,
                        clientGeneratorContext.getPoetClassNameFactory().getMediaTypesClassName(),
                        CoreMediaTypesGenerator.APPLICATION_JSON_FIELD_CONSTANT)
                .endControlFlow();
        if (isOptional) {
            requestBodyCodeBlock.endControlFlow();
        }
        requestBodyCodeBlock
                .beginControlFlow("catch($T e)", Exception.class)
                .addStatement("throw new $T(e)", RuntimeException.class)
                .endControlFlow();
    }

    private void initializeMultipartBody(
            FileUploadRequestBodyGetters fileUploadRequest,
            CodeBlock.Builder requestBodyCodeBlock,
            GeneratedObjectMapper generatedObjectMapper) {
        requestBodyCodeBlock.addStatement(
                "$T.Builder $L = new $T.Builder().setType($T.FORM)",
                MultipartBody.class,
                getMultipartBodyPropertiesName(),
                MultipartBody.class,
                MultipartBody.class);
        requestBodyCodeBlock.beginControlFlow("try");
        for (FileUploadProperty fileUploadProperty : fileUploadRequest.properties()) {
            if (fileUploadProperty instanceof JsonFileUploadProperty) {
                EnrichedObjectProperty jsonProperty = ((JsonFileUploadProperty) fileUploadProperty).objectProperty();
                if (typeNameIsOptional(jsonProperty.poetTypeName())) {
                    requestBodyCodeBlock
                            .beginControlFlow(
                                    "if ($L.$N().isPresent())", requestParameterName, jsonProperty.getterProperty())
                            .addStatement(
                                    "$L.addFormDataPart($S, $T.$L.writeValueAsString($L))",
                                    getMultipartBodyPropertiesName(),
                                    jsonProperty.wireKey().get(),
                                    generatedObjectMapper.getClassName(),
                                    generatedObjectMapper.jsonMapperStaticField().name,
                                    requestParameterName + "." + jsonProperty.getterProperty().name + "()")
                            .endControlFlow();
                } else {
                    requestBodyCodeBlock.addStatement(
                            "$L.addFormDataPart($S, $T.$L.writeValueAsString($L))",
                            getMultipartBodyPropertiesName(),
                            jsonProperty.wireKey().get(),
                            generatedObjectMapper.getClassName(),
                            generatedObjectMapper.jsonMapperStaticField().name,
                            requestParameterName + "." + jsonProperty.getterProperty().name + "()");
                }
            } else if (fileUploadProperty instanceof FilePropertyContainer) {
                FileProperty fileProperty = ((FilePropertyContainer) fileUploadProperty).fileProperty();
                NameAndWireValue filePropertyKey = fileProperty.visit(new GetFilePropertyKey());
                String filePropertyName =
                        filePropertyKey.getName().getCamelCase().getUnsafeName();
                String mimeTypeVariableName = filePropertyName + "MimeType";
                String mediaTypeVariableName = mimeTypeVariableName + "MediaType";
                String filePropertyParameterName = getFilePropertyParameterName(fileProperty);
                if (fileProperty.visit(new FilePropertyIsOptional())) {
                    requestBodyCodeBlock
                            .beginControlFlow("if ($N.isPresent())", getFilePropertyParameterName(fileProperty))
                            .addStatement(
                                    "String $L = $T.probeContentType($L.get().toPath())",
                                    mimeTypeVariableName,
                                    Files.class,
                                    filePropertyParameterName)
                            .addStatement(
                                    "$T $L = $L != null ? $T.parse($L) : null",
                                    MediaType.class,
                                    mediaTypeVariableName,
                                    mimeTypeVariableName,
                                    MediaType.class,
                                    mimeTypeVariableName)
                            .addStatement(
                                    "$L.addFormDataPart($S, $L.get().getName(), $T.create($L, $L.get()))",
                                    getMultipartBodyPropertiesName(),
                                    filePropertyKey.getWireValue(),
                                    filePropertyParameterName,
                                    RequestBody.class,
                                    mediaTypeVariableName,
                                    filePropertyParameterName)
                            .endControlFlow();
                } else {
                    requestBodyCodeBlock
                            .addStatement(
                                    "String $L = $T.probeContentType($L.toPath())",
                                    mimeTypeVariableName,
                                    Files.class,
                                    filePropertyParameterName)
                            .addStatement(
                                    "$T $L = $L != null ? $T.parse($L) : null",
                                    MediaType.class,
                                    mediaTypeVariableName,
                                    mimeTypeVariableName,
                                    MediaType.class,
                                    mimeTypeVariableName)
                            .addStatement(
                                    "$L.addFormDataPart($S, $L.getName(), $T.create($L, $L))",
                                    getMultipartBodyPropertiesName(),
                                    filePropertyKey.getWireValue(),
                                    getFilePropertyParameterName(fileProperty),
                                    RequestBody.class,
                                    mediaTypeVariableName,
                                    getFilePropertyParameterName(fileProperty));
                }
            }
        }
        requestBodyCodeBlock
                .endControlFlow()
                .beginControlFlow("catch($T e)", Exception.class)
                .addStatement("throw new $T(e)", RuntimeException.class)
                .endControlFlow();
    }

    private static boolean typeNameIsOptional(TypeName typeName) {
        return typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class));
    }

    private static String getFilePropertyParameterName(FileProperty fileProperty) {
        return fileProperty
                .visit(new GetFilePropertyKey())
                .getName()
                .getCamelCase()
                .getSafeName();
    }
}
