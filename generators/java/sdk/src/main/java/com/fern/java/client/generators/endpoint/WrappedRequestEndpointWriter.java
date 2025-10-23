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
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.http.*;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.MapType;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
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
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.nio.file.Files;
import java.util.Optional;
import okhttp3.*;

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
        this.httpEndpoint = httpEndpoint;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedWrappedRequest = generatedWrappedRequest;
        this.sdkRequest = sdkRequest;
        this.requestParameterName =
                sdkRequest.getRequestParameterName().getCamelCase().getSafeName();
    }

    @SuppressWarnings("checkstyle:CyclomaticComplexity")
    @Override
    public CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint _unused,
            String contentType,
            GeneratedObjectMapper generatedObjectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType) {
        CodeBlock.Builder requestBodyCodeBlock = CodeBlock.builder();
        boolean isFileUpload = generatedWrappedRequest.requestBodyGetter().isPresent()
                && generatedWrappedRequest.requestBodyGetter().get() instanceof FileUploadRequestBodyGetters;
        Optional<CodeBlock> inlinedRequestBodyBuilder = Optional.empty();
        if (generatedWrappedRequest.requestBodyGetter().isPresent()) {
            if (generatedWrappedRequest.requestBodyGetter().get()
                    instanceof GeneratedWrappedRequest.UrlFormEncodedGetters) {
                GeneratedWrappedRequest.UrlFormEncodedGetters urlFormEncodedGetters =
                        ((GeneratedWrappedRequest.UrlFormEncodedGetters)
                                generatedWrappedRequest.requestBodyGetter().get());
                initializeUrlFormEncodedBody(urlFormEncodedGetters, requestBodyCodeBlock);
                inlinedRequestBodyBuilder =
                        Optional.of(CodeBlock.of("$L.build()", variables.getOkhttpRequestBodyName()));
            } else if (generatedWrappedRequest.requestBodyGetter().get() instanceof ReferencedRequestBodyGetter) {
                String jsonRequestBodyArgument = requestParameterName + "."
                        + ((ReferencedRequestBodyGetter) generatedWrappedRequest
                                        .requestBodyGetter()
                                        .get())
                                .requestBodyGetter()
                                .name
                        + "()";
                initializeRequestBody(
                        generatedObjectMapper,
                        jsonRequestBodyArgument,
                        requestBodyCodeBlock,
                        sendContentType,
                        contentType);
            } else if (generatedWrappedRequest.requestBodyGetter().get() instanceof InlinedRequestBodyGetters) {
                InlinedRequestBodyGetters inlinedRequestBodyGetter = ((InlinedRequestBodyGetters)
                        generatedWrappedRequest.requestBodyGetter().get());
                // Serialize the request object directly instead of manually building a properties map.
                initializeRequestBody(
                        generatedObjectMapper,
                        requestParameterName,
                        requestBodyCodeBlock,
                        sendContentType,
                        contentType);
            } else if (generatedWrappedRequest.requestBodyGetter().get() instanceof FileUploadRequestBodyGetters) {
                FileUploadRequestBodyGetters fileUploadRequestBodyGetter = ((FileUploadRequestBodyGetters)
                        generatedWrappedRequest.requestBodyGetter().get());
                initializeMultipartBody(fileUploadRequestBodyGetter, requestBodyCodeBlock, generatedObjectMapper);
                inlinedRequestBodyBuilder =
                        Optional.of(CodeBlock.of("$L.build()", variables.getOkhttpRequestBodyName()));
            }
        } else {
            if (httpEndpoint.getMethod().equals(HttpMethod.POST)
                    || httpEndpoint.getMethod().equals(HttpMethod.PUT)) {
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
                    ".method($S, $L)\n", httpEndpoint.getMethod().toString(), variables.getOkhttpRequestBodyName());
        }
        Optional<CodeBlock> maybeAcceptsHeader = AbstractEndpointWriter.maybeAcceptsHeader(httpEndpoint);
        requestBodyCodeBlock.add(
                ".headers($T.of($L.$L($L)))",
                Headers.class,
                clientOptionsMember.name,
                ClientOptionsGenerator.HEADERS_METHOD_NAME,
                AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME);
        if (sendContentType && !isFileUpload) {
            requestBodyCodeBlock.add("\n.addHeader($S, $S)", AbstractEndpointWriter.CONTENT_TYPE_HEADER, contentType);
        }
        maybeAcceptsHeader.ifPresent(
                acceptsHeader -> requestBodyCodeBlock.add("\n").add(acceptsHeader));
        requestBodyCodeBlock.add(";\n");
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
                "$T $L = $L.build()", Request.class, variables.getOkhttpRequestName(), REQUEST_BUILDER_NAME);
        return requestBodyCodeBlock.build();
    }

    private void initializeRequestBody(
            GeneratedObjectMapper generatedObjectMapper,
            String variableToJsonify,
            CodeBlock.Builder requestBodyCodeBlock,
            boolean sendContentType,
            String contentType) {

        boolean isOptional = false;
        if (this.httpEndpoint.getRequestBody().isPresent()) {
            isOptional = HttpRequestBodyIsWrappedInOptional.isOptional(
                    this.httpEndpoint.getRequestBody().get());
        }

        requestBodyCodeBlock
                .addStatement("$T $L", RequestBody.class, variables.getOkhttpRequestBodyName())
                .beginControlFlow("try");
        if (isOptional) {
            // Set a default empty response body and begin a conditional, prior to parsing the RequestBody
            requestBodyCodeBlock
                    .addStatement("$L = $T.create(\"\", null)", variables.getOkhttpRequestBodyName(), RequestBody.class)
                    .beginControlFlow("if ($N.isPresent())", variableToJsonify);
        }
        CodeBlock requestBodyContentType = CodeBlock.of(
                "$T.$L",
                clientGeneratorContext.getPoetClassNameFactory().getMediaTypesClassName(),
                CoreMediaTypesGenerator.APPLICATION_JSON_FIELD_CONSTANT);

        if (sendContentType && !contentType.equals(AbstractEndpointWriter.APPLICATION_JSON_HEADER)) {
            requestBodyContentType = CodeBlock.of("$T.parse($S)", MediaType.class, contentType);
        }

        requestBodyCodeBlock
                .addStatement(
                        "$L = $T.create($T.$L.writeValueAsBytes($L), $L)",
                        variables.getOkhttpRequestBodyName(),
                        RequestBody.class,
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        variableToJsonify,
                        requestBodyContentType)
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
                variables.getMultipartBodyPropertiesName(),
                MultipartBody.class,
                MultipartBody.class);
        requestBodyCodeBlock.beginControlFlow("try");
        for (FileUploadProperty fileUploadProperty : fileUploadRequest.properties()) {
            if (fileUploadProperty instanceof JsonFileUploadProperty) {
                EnrichedObjectProperty jsonProperty = ((JsonFileUploadProperty) fileUploadProperty).objectProperty();
                Optional<FileUploadBodyPropertyEncoding> style = ((JsonFileUploadProperty) fileUploadProperty)
                        .rawProperty()
                        .getStyle();
                boolean isOptional = typeNameIsOptional(jsonProperty.poetTypeName());
                boolean formStyle = style.isPresent() && style.get().equals(FileUploadBodyPropertyEncoding.FORM);
                boolean isCollection = ((JsonFileUploadProperty) fileUploadProperty)
                        .rawProperty()
                        .getValueType()
                        .visit(new TypeReferenceIsCollection(clientGeneratorContext));

                CodeBlock addDataPart;

                if (formStyle) {
                    addDataPart = CodeBlock.of(
                            "$T.addFormDataPart($L, $S, $L, false)",
                            clientGeneratorContext.getPoetClassNameFactory().getQueryStringMapperClassName(),
                            variables.getMultipartBodyPropertiesName(),
                            jsonProperty.wireKey().get(),
                            requestParameterName + "." + jsonProperty.getterProperty().name + "()"
                                    + (isOptional ? ".get()" : ""));
                } else {
                    CodeBlock.Builder dataPartBuilder = CodeBlock.builder();
                    String writeValueParameter = requestParameterName + "." + jsonProperty.getterProperty().name + "()"
                            + (isOptional ? ".get()" : "");

                    if (isCollection) {
                        String collection = writeValueParameter;
                        // Only way a collection is named is being an alias.
                        boolean collectionIsAlias = ((JsonFileUploadProperty) fileUploadProperty)
                                .rawProperty()
                                .getValueType()
                                .isNamed();
                        if (clientGeneratorContext.getCustomConfig().wrappedAliases() && collectionIsAlias) {
                            collection += ".get()";
                        }
                        writeValueParameter = "item";
                        dataPartBuilder.add("$L.forEach($L -> {\n", collection, writeValueParameter);
                        dataPartBuilder.indent();
                        dataPartBuilder.beginControlFlow("try");
                    }

                    dataPartBuilder.add(
                            "$L.addFormDataPart($S, $T.$L.writeValueAsString($L))" + (isCollection ? ";\n" : ""),
                            variables.getMultipartBodyPropertiesName(),
                            jsonProperty.wireKey().get(),
                            generatedObjectMapper.getClassName(),
                            generatedObjectMapper.jsonMapperStaticField().name,
                            writeValueParameter);

                    if (isCollection) {
                        dataPartBuilder.endControlFlow();
                        dataPartBuilder.beginControlFlow("catch ($T e)", JsonProcessingException.class);
                        dataPartBuilder.add(
                                "throw new $T($S, e);\n", RuntimeException.class, "Failed to write value as JSON");
                        dataPartBuilder.endControlFlow();
                        dataPartBuilder.unindent();
                        dataPartBuilder.add("})");
                    }

                    addDataPart = dataPartBuilder.build();
                }

                if (isOptional) {
                    requestBodyCodeBlock.beginControlFlow(
                            "if ($L.$N().isPresent())", requestParameterName, jsonProperty.getterProperty());
                }

                requestBodyCodeBlock.addStatement(addDataPart);

                if (isOptional) {
                    requestBodyCodeBlock.endControlFlow();
                }
            } else if (fileUploadProperty instanceof FilePropertyContainer) {
                FileProperty fileProperty = ((FilePropertyContainer) fileUploadProperty).fileProperty();
                NameAndWireValue filePropertyKey = fileProperty.visit(new GetFilePropertyKey());
                String filePropertyName =
                        filePropertyKey.getName().getCamelCase().getUnsafeName();
                String mimeTypeVariableName = filePropertyName + "MimeType";
                String mediaTypeVariableName = mimeTypeVariableName + "MediaType";
                String filePropertyParameterName =
                        WrappedRequestEndpointWriterVariableNameContext.getFilePropertyParameterName(
                                clientGeneratorContext, fileProperty);
                if (fileProperty.visit(new FilePropertyIsOptional())) {
                    requestBodyCodeBlock
                            .beginControlFlow("if ($N.isPresent())", filePropertyParameterName)
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
                                    "$L.addFormDataPart($S, $L.get().getName(), $T.create($L.get(), $L))",
                                    variables.getMultipartBodyPropertiesName(),
                                    filePropertyKey.getWireValue(),
                                    filePropertyParameterName,
                                    RequestBody.class,
                                    filePropertyParameterName,
                                    mediaTypeVariableName)
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
                                    variables.getMultipartBodyPropertiesName(),
                                    filePropertyKey.getWireValue(),
                                    filePropertyParameterName,
                                    RequestBody.class,
                                    filePropertyParameterName,
                                    mediaTypeVariableName);
                }
            }
        }
        requestBodyCodeBlock
                .endControlFlow()
                .beginControlFlow("catch($T e)", Exception.class)
                .addStatement("throw new $T(e)", RuntimeException.class)
                .endControlFlow();
    }

    private void initializeUrlFormEncodedBody(
            GeneratedWrappedRequest.UrlFormEncodedGetters urlFormEncodedGetters,
            CodeBlock.Builder requestBodyCodeBlock) {
        requestBodyCodeBlock.addStatement(
                "$T.Builder $L = new $T.Builder()",
                FormBody.class,
                variables.getOkhttpRequestBodyName(),
                FormBody.class);
        requestBodyCodeBlock.beginControlFlow("try");

        for (EnrichedObjectProperty property : urlFormEncodedGetters.properties()) {
            String propertyGetter = requestParameterName + "." + property.getterProperty().name + "()";
            boolean isOptional = typeNameIsOptional(property.poetTypeName());

            if (isOptional) {
                requestBodyCodeBlock
                        .beginControlFlow("if ($L.isPresent())", propertyGetter)
                        .addStatement(
                                "$L.add($S, String.valueOf($L.get()))",
                                variables.getOkhttpRequestBodyName(),
                                property.wireKey().get(),
                                propertyGetter)
                        .endControlFlow();
            } else {
                requestBodyCodeBlock.addStatement(
                        "$L.add($S, String.valueOf($L))",
                        variables.getOkhttpRequestBodyName(),
                        property.wireKey().get(),
                        propertyGetter);
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

    private static final class TypeReferenceIsCollection
            implements TypeReference.Visitor<Boolean>, ContainerType.Visitor<Boolean> {

        private final AbstractGeneratorContext<?, ?> context;

        private TypeReferenceIsCollection(AbstractGeneratorContext<?, ?> context) {
            this.context = context;
        }

        @Override
        public Boolean visitContainer(ContainerType containerType) {
            return containerType.visit(this);
        }

        @Override
        public Boolean visitNamed(NamedType namedType) {
            TypeDeclaration declaration = Optional.ofNullable(
                            context.getTypeDeclarations().get(namedType.getTypeId()))
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Received type id " + namedType.getTypeId() + " with no corresponding type declaration."));
            if (declaration.getShape().getAlias().isPresent()) {
                Optional<ContainerType> maybeContainer = declaration
                        .getShape()
                        .getAlias()
                        .get()
                        .getResolvedType()
                        .getContainer();
                return maybeContainer.isPresent()
                        && (maybeContainer.get().isList()
                                || maybeContainer.get().isSet());
            }
            return false;
        }

        @Override
        public Boolean visitPrimitive(PrimitiveType primitiveType) {
            return false;
        }

        @Override
        public Boolean visitUnknown() {
            return false;
        }

        @Override
        public Boolean visitList(TypeReference typeReference) {
            return true;
        }

        @Override
        public Boolean visitMap(MapType mapType) {
            return false;
        }

        @Override
        public Boolean visitNullable(TypeReference typeReference) {
            return false;
        }

        @Override
        public Boolean visitOptional(TypeReference typeReference) {
            return typeReference.visit(this);
        }

        @Override
        public Boolean visitSet(TypeReference typeReference) {
            return true;
        }

        @Override
        public Boolean visitLiteral(Literal literal) {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object o) {
            return false;
        }
    }
}
