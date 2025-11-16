package com.fern.java.client.generators.endpoint;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.http.*;
import com.fern.ir.model.types.AliasTypeDeclaration;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.EnumTypeDeclaration;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.SingleUnionType;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.UndiscriminatedUnionMember;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.ir.model.types.UnionTypeDeclaration;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.ObjectMapperUtils;
import com.fern.java.utils.TypeReferenceUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import okhttp3.OkHttpClient;

public abstract class AbstractHttpResponseParserGenerator {

    private static final String INTEGER_ONE = "1";
    private static final String DECIMAL_ONE = "1.0";

    /** Helper method to generate diagnostic string for container types. Useful for debugging and error messages. */
    private static String getContainerDiagnosticString(com.fern.ir.model.types.ContainerType container) {
        return "Container details - isOptional:" + container.isOptional()
                + ", isNullable:" + container.isNullable()
                + ", isList:" + container.isList()
                + ", isSet:" + container.isSet()
                + ", isMap:" + container.isMap()
                + ", isLiteral:" + container.getLiteral().isPresent();
    }

    protected final AbstractEndpointWriterVariableNameContext variables;
    protected final ClientGeneratorContext clientGeneratorContext;
    protected final HttpEndpoint httpEndpoint;
    protected final ClassName apiErrorClassName;
    protected final ClassName baseErrorClassName;
    protected final GeneratedClientOptions generatedClientOptions;
    protected final GeneratedObjectMapper generatedObjectMapper;
    protected final FieldSpec clientOptionsField;
    protected final Map<ErrorId, GeneratedJavaFile> generatedErrors;

    public AbstractHttpResponseParserGenerator(
            AbstractEndpointWriterVariableNameContext variables,
            ClientGeneratorContext clientGeneratorContext,
            HttpEndpoint httpEndpoint,
            ClassName apiErrorClassName,
            ClassName baseErrorClassName,
            GeneratedClientOptions generatedClientOptions,
            GeneratedObjectMapper generatedObjectMapper,
            FieldSpec clientOptionsField,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        this.variables = variables;
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpEndpoint = httpEndpoint;
        this.apiErrorClassName = apiErrorClassName;
        this.baseErrorClassName = baseErrorClassName;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedObjectMapper = generatedObjectMapper;
        this.clientOptionsField = clientOptionsField;
        this.generatedErrors = generatedErrors;
    }

    public abstract void maybeInitializeFuture(CodeBlock.Builder httpResponseBuilder, TypeName responseType);

    public abstract void addNoBodySuccessResponse(CodeBlock.Builder httpResponseBuilder);

    public abstract void addEndpointWithoutRequestOptionsReturnStatement(
            MethodSpec.Builder endpointWithoutRequestOptionsBuilder,
            MethodSpec endpointWithRequestOptions,
            List<String> paramNames);

    public abstract void addEndpointWithoutRequestReturnStatement(
            MethodSpec.Builder endpointWithoutRequestBuilder,
            MethodSpec endpointWithRequestOptions,
            List<String> paramNamesWoBody,
            ParameterSpec bodyParameterSpec);

    public abstract CodeBlock getByteArrayEndpointBaseMethodBody(
            CodeBlock.Builder methodBodyBuilder,
            MethodSpec byteArrayBaseMethodSpec,
            ParameterSpec requestParameterSpec,
            MethodSpec endpointWithRequestOptions);

    public abstract void addResponseHandlingCode(
            CodeBlock.Builder httpResponseBuilder,
            Consumer<CodeBlock.Builder> onResponseWriter,
            Consumer<CodeBlock.Builder> onFailureWriter);

    public abstract void handleSuccessfulResult(CodeBlock.Builder httpResponseBuilder, CodeBlock resultExpression);

    public abstract void handleExceptionalResult(CodeBlock.Builder httpResponseBuilder, CodeBlock resultExpression);

    public abstract void addTryWithResourcesVariant(CodeBlock.Builder httpResponseBuilder);

    public abstract void addNonTryWithResourcesVariant(CodeBlock.Builder httpResponseBuilder);

    public abstract void addGenericFailureCodeBlock(CodeBlock.Builder httpResponseBuilder);

    public abstract CodeBlock getNextPageGetter(String endpointName, String methodParameters);

    public CodeBlock getResponseParserCodeBlock(MethodSpec.Builder endpointMethodBuilder) {
        CodeBlock.Builder httpResponseBuilder = CodeBlock.builder()
                // Default the request client
                .addStatement(
                        "$T $L = $N.$N()",
                        OkHttpClient.class,
                        variables.getDefaultedClientName(),
                        clientOptionsField,
                        generatedClientOptions.httpClient())
                .beginControlFlow(
                        "if ($L != null && $L.getTimeout().isPresent())",
                        AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME,
                        AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME)
                // Set the client's callTimeout if requestOptions overrides it has one
                .addStatement(
                        "$L = $N.$N($L)",
                        variables.getDefaultedClientName(),
                        clientOptionsField,
                        generatedClientOptions.httpClientWithTimeout(),
                        AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME)
                .endControlFlow();
        maybeInitializeFuture(httpResponseBuilder, getResponseType(httpEndpoint, clientGeneratorContext));

        addResponseHandlingCode(
                httpResponseBuilder,
                builder -> {
                    beginResponseProcessingTryBlock(builder);
                    addSuccessResponseCodeBlock(builder, endpointMethodBuilder);
                    httpResponseBuilder.endControlFlow();
                    addMappedFailuresCodeBlock(builder);
                    httpResponseBuilder.endControlFlow();
                },
                this::addGenericFailureCodeBlock);

        return httpResponseBuilder.build();
    }

    public void addSuccessResponseCodeBlock(
            CodeBlock.Builder httpResponseBuilder, MethodSpec.Builder endpointMethodBuilder) {
        if (httpEndpoint.getResponse().isPresent()
                && httpEndpoint.getResponse().get().getBody().isPresent()) {
            httpEndpoint
                    .getResponse()
                    .get()
                    .getBody()
                    .get()
                    .visit(new SuccessResponseWriter(httpResponseBuilder, endpointMethodBuilder));
        } else {
            addNoBodySuccessResponse(httpResponseBuilder);
        }
    }

    public TypeName getResponseType(HttpEndpoint httpEndpoint, ClientGeneratorContext clientGeneratorContext) {
        if (httpEndpoint.getResponse().isPresent()
                && httpEndpoint.getResponse().get().getBody().isPresent()) {
            return httpEndpoint.getResponse().get().getBody().get().visit(new HttpResponseBody.Visitor<TypeName>() {
                @Override
                public TypeName visitJson(JsonResponse json) {
                    JsonResponseBodyWithProperty body = json.visit(new JsonResponse.Visitor<>() {
                        @Override
                        public JsonResponseBodyWithProperty visitResponse(JsonResponseBody response) {
                            return JsonResponseBodyWithProperty.builder()
                                    .responseBodyType(response.getResponseBodyType())
                                    .build();
                        }

                        @Override
                        public JsonResponseBodyWithProperty visitNestedPropertyAsResponse(
                                JsonResponseBodyWithProperty nestedPropertyAsResponse) {
                            return nestedPropertyAsResponse;
                        }

                        @Override
                        public JsonResponseBodyWithProperty _visitUnknown(Object unknownType) {
                            throw new RuntimeException("Encountered unknown json response body type: " + unknownType);
                        }
                    });
                    TypeName responseType = clientGeneratorContext
                            .getPoetTypeNameMapper()
                            .convertToTypeName(true, body.getResponseBodyType());

                    boolean pagination = httpEndpoint.getPagination().isPresent()
                            && clientGeneratorContext
                                    .getGeneratorConfig()
                                    .getGeneratePaginatedClients()
                                    .orElse(false);

                    boolean isProperty = body.getResponseProperty().isPresent();

                    if (isProperty) {
                        SnippetAndResultType snippet = getNestedPropertySnippet(
                                Optional.empty(), body.getResponseProperty().get(), body.getResponseBodyType());
                        return snippet.typeName;
                    }

                    if (pagination) {
                        ClassName pagerClassName = clientGeneratorContext
                                .getPoetClassNameFactory()
                                .getPaginationClassName("SyncPagingIterable");
                        return httpEndpoint.getPagination().get().visit(new Pagination.Visitor<TypeName>() {
                            @Override
                            public TypeName visitCursor(CursorPagination cursor) {
                                SnippetAndResultType resultSnippet = getNestedPropertySnippet(
                                        cursor.getResults().getPropertyPath().map(path -> path.stream()
                                                .map(PropertyPathItem::getName)
                                                .collect(Collectors.toList())),
                                        cursor.getResults().getProperty(),
                                        body.getResponseBodyType());
                                com.fern.ir.model.types.ContainerType resultContainerType = resultSnippet
                                        .typeReference
                                        .getContainer()
                                        .orElseThrow(() -> new RuntimeException(
                                                "Unexpected non-container pagination result type"));
                                com.fern.ir.model.types.TypeReference resultUnderlyingType = resultContainerType.visit(
                                        new TypeReferenceUtils.ContainerTypeToUnderlyingType());
                                return ParameterizedTypeName.get(
                                        pagerClassName,
                                        clientGeneratorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(true, resultUnderlyingType));
                            }

                            @Override
                            public TypeName visitOffset(OffsetPagination offset) {
                                SnippetAndResultType resultSnippet = getNestedPropertySnippet(
                                        offset.getResults().getPropertyPath().map(path -> path.stream()
                                                .map(PropertyPathItem::getName)
                                                .collect(Collectors.toList())),
                                        offset.getResults().getProperty(),
                                        body.getResponseBodyType());
                                com.fern.ir.model.types.ContainerType resultContainerType = resultSnippet
                                        .typeReference
                                        .getContainer()
                                        .orElseThrow(() -> new RuntimeException(
                                                "Unexpected non-container pagination result type"));
                                com.fern.ir.model.types.TypeReference resultUnderlyingType = resultContainerType.visit(
                                        new TypeReferenceUtils.ContainerTypeToUnderlyingType());
                                return ParameterizedTypeName.get(
                                        pagerClassName,
                                        clientGeneratorContext
                                                .getPoetTypeNameMapper()
                                                .convertToTypeName(true, resultUnderlyingType));
                            }

                            @Override
                            public TypeName visitCustom(CustomPagination customPagination) {
                                // For custom pagination, return the response type directly
                                // without wrapping in a Pager. The user is responsible for
                                // implementing their own pagination logic.
                                return responseType;
                            }

                            @Override
                            public TypeName _visitUnknown(Object o) {
                                throw new RuntimeException("Unknown pagination type " + o);
                            }
                        });
                    }

                    return responseType;
                }

                @Override
                public TypeName visitFileDownload(FileDownloadResponse fileDownloadResponse) {
                    return ClassName.get(InputStream.class);
                }

                @Override
                public TypeName visitText(TextResponse textResponse) {
                    return ClassName.get(String.class);
                }

                @Override
                public TypeName visitBytes(BytesResponse bytesResponse) {
                    throw new RuntimeException("Returning bytes is not supported.");
                }

                @Override
                public TypeName visitStreaming(StreamingResponse streaming) {
                    com.fern.ir.model.types.TypeReference bodyType = streaming.visit(new StreamingResponse.Visitor<>() {
                        @Override
                        public com.fern.ir.model.types.TypeReference visitJson(JsonStreamChunk json) {
                            return json.getPayload();
                        }

                        @Override
                        public com.fern.ir.model.types.TypeReference visitText(TextStreamChunk text) {
                            throw new RuntimeException("Returning streamed text is not supported.");
                        }

                        @Override
                        public com.fern.ir.model.types.TypeReference visitSse(SseStreamChunk sse) {
                            return sse.getPayload();
                        }

                        @Override
                        public com.fern.ir.model.types.TypeReference _visitUnknown(Object unknownType) {
                            throw new RuntimeException("Encountered unknown json response body type: " + unknownType);
                        }
                    });

                    TypeName bodyTypeName =
                            clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, bodyType);
                    return ParameterizedTypeName.get(ClassName.get(Iterable.class), bodyTypeName);
                }

                @Override
                public TypeName visitStreamParameter(StreamParameterResponse streamParameterResponse) {
                    // TODO: Implement stream parameters.
                    throw new UnsupportedOperationException("Not implemented.");
                }

                @Override
                public TypeName _visitUnknown(Object o) {
                    return TypeName.VOID;
                }
            });
        } else {
            return TypeName.VOID;
        }
    }

    protected boolean shouldPreReadResponseBodyString() {
        if (httpEndpoint.getResponse().isPresent()
                && httpEndpoint.getResponse().get().getBody().isPresent()) {
            return httpEndpoint.getResponse().get().getBody().get().visit(new HttpResponseBody.Visitor<Boolean>() {
                @Override
                public Boolean visitJson(JsonResponse jsonResponse) {
                    return true;
                }

                @Override
                public Boolean visitFileDownload(FileDownloadResponse fileDownloadResponse) {
                    return false;
                }

                @Override
                public Boolean visitText(TextResponse textResponse) {
                    return true;
                }

                @Override
                public Boolean visitBytes(BytesResponse bytesResponse) {
                    return false;
                }

                @Override
                public Boolean visitStreaming(StreamingResponse streamingResponse) {
                    return false;
                }

                @Override
                public Boolean visitStreamParameter(StreamParameterResponse streamParameterResponse) {
                    return false;
                }

                @Override
                public Boolean _visitUnknown(Object o) {
                    return false;
                }
            });
        }
        return false;
    }

    public void beginResponseProcessingTryBlock(CodeBlock.Builder httpResponseBuilder) {
        if (httpEndpoint.getResponse().isPresent()
                && httpEndpoint.getResponse().get().getBody().isPresent()) {
            httpEndpoint.getResponse().get().getBody().get().visit(new HttpResponseBody.Visitor<Void>() {
                @Override
                public Void visitJson(JsonResponse jsonResponse) {
                    addTryWithResourcesVariant(httpResponseBuilder);
                    return null;
                }

                @Override
                public Void visitFileDownload(FileDownloadResponse fileDownloadResponse) {
                    addNonTryWithResourcesVariant(httpResponseBuilder);
                    return null;
                }

                @Override
                public Void visitText(TextResponse textResponse) {
                    addTryWithResourcesVariant(httpResponseBuilder);
                    return null;
                }

                @Override
                public Void visitBytes(BytesResponse bytesResponse) {
                    throw new RuntimeException("Returning bytes is not supported.");
                }

                @Override
                public Void visitStreaming(StreamingResponse streamingResponse) {
                    addNonTryWithResourcesVariant(httpResponseBuilder);
                    return null;
                }

                @Override
                public Void visitStreamParameter(StreamParameterResponse streamParameterResponse) {
                    // TODO: Implement stream parameters.
                    throw new UnsupportedOperationException("Not implemented.");
                }

                @Override
                public Void _visitUnknown(Object o) {
                    return null;
                }
            });
        } else {
            addTryWithResourcesVariant(httpResponseBuilder);
        }
    }

    public void addMappedFailuresCodeBlock(CodeBlock.Builder httpResponseBuilder) {
        ObjectMapperUtils objectMapperUtils = new ObjectMapperUtils(clientGeneratorContext, generatedObjectMapper);

        if (!shouldPreReadResponseBodyString()) {
            httpResponseBuilder.addStatement(
                    "$T $L = $L != null ? $L.string() : $S",
                    String.class,
                    variables.getResponseBodyStringName(),
                    variables.getResponseBodyName(),
                    variables.getResponseBodyName(),
                    "{}");
        }

        // map to status-specific errors
        if (clientGeneratorContext.getIr().getErrorDiscriminationStrategy().isStatusCode()) {
            List<ErrorDeclaration> errorDeclarations = httpEndpoint.getErrors().get().stream()
                    .map(responseError -> clientGeneratorContext
                            .getIr()
                            .getErrors()
                            .get(responseError.getError().getErrorId()))
                    .sorted(Comparator.comparingInt(ErrorDeclaration::getStatusCode))
                    .collect(Collectors.toList());
            if (!errorDeclarations.isEmpty()) {
                boolean multipleErrors = errorDeclarations.size() > 1;
                httpResponseBuilder.beginControlFlow("try");
                if (multipleErrors) {
                    httpResponseBuilder.beginControlFlow("switch ($L.code())", variables.getResponseName());
                }
                errorDeclarations.forEach(errorDeclaration -> {
                    GeneratedJavaFile generatedError =
                            generatedErrors.get(errorDeclaration.getName().getErrorId());
                    ClassName errorClassName = generatedError.getClassName();
                    if (multipleErrors) {
                        httpResponseBuilder.add("case $L:", errorDeclaration.getStatusCode());
                    } else {
                        httpResponseBuilder.beginControlFlow(
                                "if ($L.code() == $L)", variables.getResponseName(), errorDeclaration.getStatusCode());
                    }
                    handleExceptionalResult(
                            httpResponseBuilder,
                            CodeBlock.of(
                                    "new $T($L, $L)",
                                    errorClassName,
                                    objectMapperUtils.readValueCall(
                                            CodeBlock.of("$L", variables.getResponseBodyStringName()),
                                            errorDeclaration.getType()),
                                    "response"));
                    if (!multipleErrors) {
                        httpResponseBuilder.endControlFlow();
                    }
                });
                if (multipleErrors) {
                    httpResponseBuilder.endControlFlow();
                }
                httpResponseBuilder
                        .endControlFlow()
                        .beginControlFlow("catch ($T ignored)", JsonProcessingException.class)
                        .add("// unable to map error response, throwing generic error\n")
                        .endControlFlow();
            }
        }
        httpResponseBuilder.addStatement(
                "$T errorBody = $T.parseErrorBody($L)",
                Object.class,
                clientGeneratorContext.getPoetClassNameFactory().getObjectMapperClassName(),
                variables.getResponseBodyStringName());

        handleExceptionalResult(
                httpResponseBuilder,
                CodeBlock.of(
                        "new $T($S + $L.code(), $L.code(), errorBody, $L)",
                        apiErrorClassName,
                        "Error with status code ",
                        variables.getResponseName(),
                        variables.getResponseName(),
                        "response"));
    }

    protected ClassName rawHttpResponseClassName() {
        return clientGeneratorContext
                .getPoetClassNameFactory()
                .getHttpResponseClassName(
                        clientGeneratorContext.getGeneratorConfig().getOrganization(),
                        clientGeneratorContext.getGeneratorConfig().getWorkspaceName(),
                        clientGeneratorContext.getCustomConfig());
    }

    private final class SuccessResponseWriter implements HttpResponseBody.Visitor<Void> {

        private final com.squareup.javapoet.CodeBlock.Builder httpResponseBuilder;
        private final MethodSpec.Builder endpointMethodBuilder;

        SuccessResponseWriter(CodeBlock.Builder httpResponseBuilder, MethodSpec.Builder endpointMethodBuilder) {
            this.httpResponseBuilder = httpResponseBuilder;
            this.endpointMethodBuilder = endpointMethodBuilder;
        }

        @Override
        public Void visitJson(JsonResponse json) {
            JsonResponseBodyWithProperty body = json.visit(new JsonResponse.Visitor<>() {
                @Override
                public JsonResponseBodyWithProperty visitResponse(JsonResponseBody response) {
                    return JsonResponseBodyWithProperty.builder()
                            .responseBodyType(response.getResponseBodyType())
                            .build();
                }

                @Override
                public JsonResponseBodyWithProperty visitNestedPropertyAsResponse(
                        JsonResponseBodyWithProperty nestedPropertyAsResponse) {
                    return nestedPropertyAsResponse;
                }

                @Override
                public JsonResponseBodyWithProperty _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Encountered unknown json response body type: " + unknownType);
                }
            });
            TypeName responseType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, body.getResponseBodyType());
            boolean pagination = httpEndpoint.getPagination().isPresent()
                    && clientGeneratorContext
                            .getGeneratorConfig()
                            .getGeneratePaginatedClients()
                            .orElse(false);

            boolean isProperty = body.getResponseProperty().isPresent();

            if (isProperty) {
                ObjectMapperUtils objectMapperUtils =
                        new ObjectMapperUtils(clientGeneratorContext, generatedObjectMapper);
                httpResponseBuilder.add("$T $L = ", responseType, variables.getParsedResponseVariableName());
                httpResponseBuilder.addStatement(objectMapperUtils.readValueCall(
                        CodeBlock.of("$L", variables.getResponseBodyStringName()),
                        Optional.of(body.getResponseBodyType())));
                SnippetAndResultType snippet = getNestedPropertySnippet(
                        Optional.empty(), body.getResponseProperty().get(), body.getResponseBodyType());
                handleSuccessfulResult(
                        httpResponseBuilder,
                        CodeBlock.builder()
                                .add("$L", variables.getParsedResponseVariableName())
                                .add(snippet.codeBlock)
                                .build());
                endpointMethodBuilder.returns(snippet.typeName);

                if (clientGeneratorContext.getCustomConfig().useNullableAnnotation()
                        && com.fern.java.utils.NullableAnnotationUtils.isNullableType(body.getResponseBodyType())
                        && !snippet.typeName.isPrimitive()) {
                    endpointMethodBuilder.addAnnotation(
                            com.fern.java.utils.NullableAnnotationUtils.getNullableAnnotation());
                }

                return null;
            }

            if (pagination) {
                ObjectMapperUtils objectMapperUtils =
                        new ObjectMapperUtils(clientGeneratorContext, generatedObjectMapper);
                httpResponseBuilder.add("$T $L = ", responseType, variables.getParsedResponseVariableName());
                httpResponseBuilder.addStatement(objectMapperUtils.readValueCall(
                        CodeBlock.of("$L", variables.getResponseBodyStringName()),
                        Optional.of(body.getResponseBodyType())));
                ParameterSpec requestParameterSpec = variables
                        .requestParameterSpec()
                        .orElseThrow(() -> new RuntimeException("Unexpected no parameter spec for paginated endpoint"));
                String endpointName =
                        httpEndpoint.getName().get().getCamelCase().getSafeName();
                String methodParameters = endpointMethodBuilder.parameters.stream()
                        .map(parameterSpec -> parameterSpec.name.equals(requestParameterSpec.name)
                                ? variables.getNextRequestVariableName()
                                : parameterSpec.name)
                        .collect(Collectors.joining(", "));
                httpEndpoint
                        .getPagination()
                        .get()
                        .visit(new JsonResponsePaginationVisitor(
                                httpResponseBuilder,
                                endpointMethodBuilder,
                                requestParameterSpec,
                                body,
                                endpointName,
                                methodParameters));
                return null;
            }

            endpointMethodBuilder.returns(responseType);

            if (clientGeneratorContext.getCustomConfig().useNullableAnnotation()
                    && com.fern.java.utils.NullableAnnotationUtils.isNullableType(body.getResponseBodyType())
                    && !responseType.isPrimitive()) {
                endpointMethodBuilder.addAnnotation(
                        com.fern.java.utils.NullableAnnotationUtils.getNullableAnnotation());
            }

            ObjectMapperUtils objectMapperUtils = new ObjectMapperUtils(clientGeneratorContext, generatedObjectMapper);
            handleSuccessfulResult(
                    httpResponseBuilder,
                    objectMapperUtils.readValueCall(
                            CodeBlock.of("$L", variables.getResponseBodyStringName()),
                            Optional.of(body.getResponseBodyType())));
            return null;
        }

        @Override
        public Void visitFileDownload(FileDownloadResponse fileDownload) {
            endpointMethodBuilder.returns(InputStream.class);
            handleSuccessfulResult(
                    httpResponseBuilder,
                    CodeBlock.of(
                            "new $T($L)",
                            clientGeneratorContext.getPoetClassNameFactory().getResponseBodyInputStreamClassName(),
                            variables.getResponseName()));
            return null;
        }

        @Override
        public Void visitText(TextResponse text) {
            endpointMethodBuilder.returns(String.class);
            handleSuccessfulResult(httpResponseBuilder, CodeBlock.of("$L", variables.getResponseBodyStringName()));
            return null;
        }

        @Override
        public Void visitBytes(BytesResponse bytesResponse) {
            throw new RuntimeException("Returning bytes is not supported.");
        }

        @Override
        public Void visitStreaming(StreamingResponse streaming) {
            com.fern.ir.model.types.TypeReference bodyType = streaming.visit(new StreamingResponse.Visitor<>() {
                @Override
                public com.fern.ir.model.types.TypeReference visitJson(JsonStreamChunk json) {
                    return json.getPayload();
                }

                @Override
                public com.fern.ir.model.types.TypeReference visitText(TextStreamChunk text) {
                    throw new RuntimeException("Returning streamed text is not supported.");
                }

                @Override
                public com.fern.ir.model.types.TypeReference visitSse(SseStreamChunk sse) {
                    return sse.getPayload();
                }

                @Override
                public com.fern.ir.model.types.TypeReference _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Encountered unknown json response body type: " + unknownType);
                }
            });

            TypeName bodyTypeName =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, bodyType);
            endpointMethodBuilder.returns(ParameterizedTypeName.get(ClassName.get(Iterable.class), bodyTypeName));

            String terminator =
                    streaming.visit(new GetStreamingResponseTerminator()).orElse(null);

            CodeBlock streamCreation = streaming.visit(new StreamingResponse.Visitor<CodeBlock>() {
                @Override
                public CodeBlock visitJson(JsonStreamChunk json) {
                    String delimiter = terminator != null ? terminator : "\\n";
                    return CodeBlock.of(
                            "$T.fromJson($T.class, new $T($L), $S)",
                            clientGeneratorContext.getPoetClassNameFactory().getStreamClassName(),
                            bodyTypeName,
                            clientGeneratorContext.getPoetClassNameFactory().getResponseBodyReaderClassName(),
                            variables.getResponseName(),
                            delimiter);
                }

                @Override
                public CodeBlock visitText(TextStreamChunk text) {
                    throw new RuntimeException("Returning streamed text is not supported.");
                }

                @Override
                public CodeBlock visitSse(SseStreamChunk sse) {
                    if (terminator != null) {
                        return CodeBlock.of(
                                "$T.fromSse($T.class, new $T($L), $S)",
                                clientGeneratorContext.getPoetClassNameFactory().getStreamClassName(),
                                bodyTypeName,
                                clientGeneratorContext.getPoetClassNameFactory().getResponseBodyReaderClassName(),
                                variables.getResponseName(),
                                terminator);
                    } else {
                        return CodeBlock.of(
                                "$T.fromSse($T.class, new $T($L))",
                                clientGeneratorContext.getPoetClassNameFactory().getStreamClassName(),
                                bodyTypeName,
                                clientGeneratorContext.getPoetClassNameFactory().getResponseBodyReaderClassName(),
                                variables.getResponseName());
                    }
                }

                @Override
                public CodeBlock _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Encountered unknown streaming response type: " + unknownType);
                }
            });

            handleSuccessfulResult(httpResponseBuilder, streamCreation);

            return null;
        }

        @Override
        public Void visitStreamParameter(StreamParameterResponse streamParameterResponse) {
            // TODO: Implement stream parameters.
            throw new UnsupportedOperationException("Not implemented.");
        }

        @Override
        public Void _visitUnknown(Object unknownType) {
            return null;
        }
    }

    private SnippetAndResultType getNestedPropertySnippet(
            Optional<List<Name>> propertyPath,
            ObjectProperty objectProperty,
            com.fern.ir.model.types.TypeReference typeReference) {
        ArrayList<Name> fullPropertyPath = propertyPath.map(ArrayList::new).orElse(new ArrayList<>());
        fullPropertyPath.add(objectProperty.getName().getName());
        GetSnippetOutput getSnippetOutput = typeReference.visit(new NestedPropertySnippetGenerator(
                typeReference,
                fullPropertyPath,
                false,
                false,
                Optional.empty(),
                Optional.empty(),
                clientGeneratorContext));
        CodeBlock.Builder codeBlockBuilder = CodeBlock.builder();
        getSnippetOutput.code.forEach(codeBlockBuilder::add);
        return new SnippetAndResultType(
                getSnippetOutput.typeReference,
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, getSnippetOutput.typeReference),
                codeBlockBuilder.build());
    }

    private class SnippetAndResultType {
        private final com.fern.ir.model.types.TypeReference typeReference;
        private final TypeName typeName;
        private final CodeBlock codeBlock;

        private SnippetAndResultType(
                com.fern.ir.model.types.TypeReference typeReference, TypeName typeName, CodeBlock codeBlock) {
            this.typeReference = typeReference;
            this.typeName = typeName;
            this.codeBlock = codeBlock;
        }
    }

    private class NestedPropertySnippetGenerator
            implements com.fern.ir.model.types.TypeReference.Visitor<GetSnippetOutput> {

        /** The current type from which we need get a property value. */
        private final com.fern.ir.model.types.TypeReference typeReference;

        private final List<Name> propertyPath;
        private final Boolean previousWasOptional;
        private final Boolean currentOptional;
        private final Optional<Name> previousProperty;
        private final Optional<com.fern.ir.model.types.TypeReference> previousTypeReference;
        private final ArrayList<CodeBlock> codeBlocks = new ArrayList<>();
        private final ClientGeneratorContext clientGeneratorContext;

        private NestedPropertySnippetGenerator(
                com.fern.ir.model.types.TypeReference typeReference,
                List<Name> propertyPath,
                Boolean previousWasOptional,
                Boolean currentOptional,
                Optional<Name> previousProperty,
                Optional<com.fern.ir.model.types.TypeReference> previousTypeReference,
                ClientGeneratorContext clientGeneratorContext) {
            this.typeReference = typeReference;
            this.propertyPath = propertyPath;
            this.previousWasOptional = previousWasOptional;
            this.currentOptional = currentOptional;
            this.previousProperty = previousProperty;
            this.previousTypeReference = previousTypeReference;
            this.clientGeneratorContext = clientGeneratorContext;
        }

        private void addPreviousIfPresent() {
            previousProperty.ifPresent(previousProperty -> {
                codeBlocks.add(getterCodeBlock(previousProperty, previousTypeReference.get()));
            });
        }

        private Name getCurrentProperty() {
            return propertyPath.get(0);
        }

        private CodeBlock getterCodeBlock(Name property, com.fern.ir.model.types.TypeReference overrideTypeReference) {
            if (previousWasOptional) {
                String mappingOperation = currentOptional ? "flatMap" : "map";
                return CodeBlock.of(
                        ".$L($T::get$L)",
                        mappingOperation,
                        clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, overrideTypeReference),
                        property.getPascalCase().getUnsafeName());
            }
            return CodeBlock.of(".get$L()", property.getPascalCase().getUnsafeName());
        }

        @Override
        public GetSnippetOutput visitContainer(com.fern.ir.model.types.ContainerType container) {
            if (propertyPath.isEmpty() && !container.isOptional()) {
                addPreviousIfPresent();
                if (currentOptional || previousWasOptional) {
                    if (container.isNullable()) {
                        codeBlocks.add(CodeBlock.builder().add(".orElse(null)").build());
                        // For nullable containers, return the underlying type since we've unwrapped it
                        com.fern.ir.model.types.TypeReference nullableType = container
                                .getNullable()
                                .orElseThrow(() -> new IllegalStateException(
                                        "Container marked as nullable but getNullable() returned empty"));
                        return new GetSnippetOutput(nullableType, codeBlocks);
                    } else if (container.isList()) {
                        codeBlocks.add(CodeBlock.builder()
                                .add(".orElse($T.emptyList())", Collections.class)
                                .build());
                    } else if (container.isSet()) {
                        codeBlocks.add(CodeBlock.builder()
                                .add(".orElse($T.emptySet())", Collections.class)
                                .build());
                    } else if (container.isMap()) {
                        codeBlocks.add(CodeBlock.builder()
                                .add(".orElse($T.emptyMap())", Collections.class)
                                .build());
                    } else if (container.getLiteral().isPresent()) {
                        throw new RuntimeException("Unexpected literal container in response parsing. " + "Literal: "
                                + container.getLiteral().get());
                    } else {
                        // This should not happen if we've covered all container types
                        throw new RuntimeException(
                                "Unexpected container type. " + getContainerDiagnosticString(container));
                    }
                }
                return new GetSnippetOutput(typeReference, codeBlocks);
            }
            com.fern.ir.model.types.TypeReference ref = container
                    .getOptional()
                    .or(() -> container.getNullable())
                    .orElseThrow(() -> new RuntimeException(
                            "Unexpected non-optional, non-nullable container type in snippet generation. "
                                    + getContainerDiagnosticString(container)));
            return ref.visit(new NestedPropertySnippetGenerator(
                    ref,
                    propertyPath,
                    previousWasOptional || currentOptional,
                    true,
                    previousProperty,
                    previousTypeReference,
                    clientGeneratorContext));
        }

        @Override
        public GetSnippetOutput visitNamed(NamedType named) {
            TypeDeclaration typeDeclaration =
                    clientGeneratorContext.getTypeDeclarations().get(named.getTypeId());
            return typeDeclaration.getShape().visit(new Type.Visitor<>() {
                @Override
                public GetSnippetOutput visitAlias(AliasTypeDeclaration alias) {
                    return alias.getAliasOf()
                            .visit(new NestedPropertySnippetGenerator(
                                    alias.getAliasOf(),
                                    propertyPath,
                                    previousWasOptional,
                                    currentOptional,
                                    previousProperty,
                                    Optional.of(typeReference),
                                    clientGeneratorContext));
                }

                @Override
                public GetSnippetOutput visitEnum(EnumTypeDeclaration enum_) {
                    // todo: figure out how to handle this
                    return null;
                }

                @Override
                public GetSnippetOutput visitObject(ObjectTypeDeclaration object) {
                    addPreviousIfPresent();
                    if (propertyPath.isEmpty()) {
                        if (currentOptional || previousWasOptional) {
                            return new GetSnippetOutput(
                                    com.fern.ir.model.types.TypeReference.container(
                                            com.fern.ir.model.types.ContainerType.optional(typeReference)),
                                    codeBlocks);
                        }
                        return new GetSnippetOutput(typeReference, codeBlocks);
                    }
                    Optional<ObjectProperty> maybeMatchingProperty = object.getProperties().stream()
                            .filter(property -> property.getName()
                                    .getName()
                                    .getCamelCase()
                                    .getUnsafeName()
                                    .equals(getCurrentProperty().getCamelCase().getUnsafeName()))
                            .findFirst();
                    if (maybeMatchingProperty.isEmpty()) {
                        for (DeclaredTypeName declaredTypeName : object.getExtends()) {
                            try {
                                return visitNamed(NamedType.builder()
                                        .typeId(declaredTypeName.getTypeId())
                                        .fernFilepath(declaredTypeName.getFernFilepath())
                                        .name(declaredTypeName.getName())
                                        .build());
                            } catch (Exception e) {
                            }
                        }
                        throw new RuntimeException("No property matches found for property "
                                + getCurrentProperty().getOriginalName());
                    }
                    ObjectProperty matchingProperty = maybeMatchingProperty.get();
                    List<Name> newPropertyPath = propertyPath.subList(1, propertyPath.size());
                    GetSnippetOutput output = matchingProperty
                            .getValueType()
                            .visit(new NestedPropertySnippetGenerator(
                                    matchingProperty.getValueType(),
                                    newPropertyPath,
                                    currentOptional || previousWasOptional,
                                    false,
                                    Optional.of(getCurrentProperty()),
                                    Optional.of(typeReference),
                                    clientGeneratorContext));
                    codeBlocks.addAll(output.code);
                    return new GetSnippetOutput(output.typeReference, codeBlocks);
                }

                @Override
                public GetSnippetOutput visitUnion(UnionTypeDeclaration union) {
                    addPreviousIfPresent();
                    if (propertyPath.isEmpty()) {
                        if (currentOptional || previousWasOptional) {
                            return new GetSnippetOutput(
                                    com.fern.ir.model.types.TypeReference.container(
                                            com.fern.ir.model.types.ContainerType.optional(typeReference)),
                                    codeBlocks);
                        }
                        return new GetSnippetOutput(typeReference, codeBlocks);
                    }

                    List<String> variantErrors = new ArrayList<>();
                    int variantIndex = 0;

                    for (SingleUnionType variant : union.getTypes()) {
                        try {
                            com.fern.ir.model.types.TypeReference variantTypeRef = variant.getShape()
                                    .visit(
                                            new com.fern.ir.model.types.SingleUnionTypeProperties.Visitor<
                                                    com.fern.ir.model.types.TypeReference>() {
                                                @Override
                                                public com.fern.ir.model.types.TypeReference
                                                        visitSamePropertiesAsObject(DeclaredTypeName declaredTypeName) {
                                                    return com.fern.ir.model.types.TypeReference.named(
                                                            NamedType.builder()
                                                                    .typeId(declaredTypeName.getTypeId())
                                                                    .fernFilepath(declaredTypeName.getFernFilepath())
                                                                    .name(declaredTypeName.getName())
                                                                    .build());
                                                }

                                                @Override
                                                public com.fern.ir.model.types.TypeReference visitSingleProperty(
                                                        com.fern.ir.model.types.SingleUnionTypeProperty
                                                                singleProperty) {
                                                    return singleProperty.getType();
                                                }

                                                @Override
                                                public com.fern.ir.model.types.TypeReference visitNoProperties() {
                                                    throw new RuntimeException(
                                                            "Cannot traverse union variant with no properties");
                                                }

                                                @Override
                                                public com.fern.ir.model.types.TypeReference _visitUnknown(
                                                        Object unknownType) {
                                                    throw new RuntimeException("Unknown variant shape");
                                                }
                                            });

                            GetSnippetOutput result = variantTypeRef.visit(new NestedPropertySnippetGenerator(
                                    variantTypeRef,
                                    propertyPath,
                                    previousWasOptional,
                                    currentOptional,
                                    previousProperty,
                                    previousTypeReference,
                                    clientGeneratorContext));

                            return result;
                        } catch (Exception e) {
                            variantErrors.add("[Variant " + variantIndex + " ("
                                    + variant.getDiscriminantValue().getWireValue() + ")]: " + e.getMessage());
                            variantIndex++;
                        }
                    }

                    throw new RuntimeException("Cannot create snippet with discriminated union - all variants failed:\n"
                            + String.join("\n", variantErrors));
                }

                @Override
                public GetSnippetOutput visitUndiscriminatedUnion(
                        UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
                    addPreviousIfPresent();
                    if (propertyPath.isEmpty()) {
                        if (currentOptional || previousWasOptional) {
                            return new GetSnippetOutput(
                                    com.fern.ir.model.types.TypeReference.container(
                                            com.fern.ir.model.types.ContainerType.optional(typeReference)),
                                    codeBlocks);
                        }
                        return new GetSnippetOutput(typeReference, codeBlocks);
                    }

                    List<String> variantErrors = new ArrayList<>();
                    int variantIndex = 0;

                    for (UndiscriminatedUnionMember member : undiscriminatedUnion.getMembers()) {
                        try {
                            com.fern.ir.model.types.TypeReference variantType = member.getType();
                            GetSnippetOutput result = variantType.visit(new NestedPropertySnippetGenerator(
                                    variantType,
                                    propertyPath,
                                    previousWasOptional,
                                    currentOptional,
                                    previousProperty,
                                    previousTypeReference,
                                    clientGeneratorContext));

                            return result;
                        } catch (Exception e) {
                            variantErrors.add("[Variant " + variantIndex + "]: " + e.getMessage());
                            variantIndex++;
                        }
                    }

                    throw new RuntimeException(
                            "Cannot create snippet with undiscriminated union - all variants failed:\n"
                                    + String.join("\n", variantErrors));
                }

                @Override
                public GetSnippetOutput _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Unknown shape " + unknownType);
                }
            });
        }

        @Override
        public GetSnippetOutput visitPrimitive(PrimitiveType primitive) {
            if (!propertyPath.isEmpty()) {
                throw new RuntimeException("Unexpected primitive with property path remaining");
            }
            addPreviousIfPresent();
            if (currentOptional || previousWasOptional) {
                return new GetSnippetOutput(
                        com.fern.ir.model.types.TypeReference.container(
                                com.fern.ir.model.types.ContainerType.optional(typeReference)),
                        codeBlocks);
            }
            return new GetSnippetOutput(typeReference, codeBlocks);
        }

        @Override
        public GetSnippetOutput visitUnknown() {
            throw new RuntimeException("Can't generate snippet for unknown type");
        }

        @Override
        public GetSnippetOutput _visitUnknown(Object unknownType) {
            throw new RuntimeException("Unknown TypeReference type " + unknownType);
        }
    }

    private class GetSnippetOutput {
        private final com.fern.ir.model.types.TypeReference typeReference;
        private final List<CodeBlock> code;

        private GetSnippetOutput(com.fern.ir.model.types.TypeReference typeReference, List<CodeBlock> code) {
            this.typeReference = typeReference;
            this.code = code;
        }
    }

    private class GetStreamingResponseTerminator implements StreamingResponse.Visitor<Optional<String>> {
        @Override
        public Optional<String> visitJson(JsonStreamChunk json) {
            return json.getTerminator();
        }

        @Override
        public Optional<String> visitText(TextStreamChunk text) {
            throw new RuntimeException("Returning streamed text is not supported.");
        }

        @Override
        public Optional<String> visitSse(SseStreamChunk sse) {
            return sse.getTerminator();
        }

        @Override
        public Optional<String> _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown streaming response type " + unknownType);
        }
    }

    private final class JsonResponsePaginationVisitor implements Pagination.Visitor<Void> {

        private final CodeBlock.Builder httpResponseBuilder;
        private final MethodSpec.Builder endpointMethodBuilder;
        private final ParameterSpec requestParameterSpec;
        private final JsonResponseBodyWithProperty body;
        private final String endpointName;
        private final String methodParameters;

        private JsonResponsePaginationVisitor(
                CodeBlock.Builder httpResponseBuilder,
                MethodSpec.Builder endpointMethodBuilder,
                ParameterSpec requestParameterSpec,
                JsonResponseBodyWithProperty body,
                String endpointName,
                String methodParameters) {
            this.httpResponseBuilder = httpResponseBuilder;
            this.endpointMethodBuilder = endpointMethodBuilder;
            this.requestParameterSpec = requestParameterSpec;
            this.body = body;
            this.endpointName = endpointName;
            this.methodParameters = methodParameters;
        }

        @Override
        public Void visitCursor(CursorPagination cursor) {
            SnippetAndResultType nextSnippet = getNestedPropertySnippet(
                    cursor.getNext().getPropertyPath().map(path -> path.stream()
                            .map(PropertyPathItem::getName)
                            .collect(Collectors.toList())),
                    cursor.getNext().getProperty(),
                    body.getResponseBodyType());
            CodeBlock nextBlock = CodeBlock.builder()
                    .add(
                            "$T $L = $L",
                            nextSnippet.typeName,
                            variables.getStartingAfterVariableName(),
                            variables.getParsedResponseVariableName())
                    .add(nextSnippet.codeBlock)
                    .build();
            httpResponseBuilder.addStatement(nextBlock);
            String builderStartingAfterProperty = cursor.getPage()
                    .getProperty()
                    .visit(new RequestPropertyValue.Visitor<String>() {
                        @Override
                        public String visitQuery(QueryParameter queryParameter) {
                            return queryParameter
                                    .getName()
                                    .getName()
                                    .getCamelCase()
                                    .getUnsafeName();
                        }

                        @Override
                        public String visitBody(ObjectProperty objectProperty) {
                            return objectProperty
                                    .getName()
                                    .getName()
                                    .getCamelCase()
                                    .getUnsafeName();
                        }

                        @Override
                        public String _visitUnknown(Object o) {
                            throw new IllegalArgumentException("Unknown request property value type.");
                        }
                    });

            String propertyOverrideOnRequest = builderStartingAfterProperty;
            String propertyOverrideValueOnRequest = variables.getStartingAfterVariableName();

            if (cursor.getPage().getPropertyPath().isPresent()
                    && !cursor.getPage().getPropertyPath().get().isEmpty()) {
                List<EnrichedCursorPathSetter> setters = PaginationPathUtils.getPathSetters(
                        cursor.getPage().getPropertyPath().get().stream()
                                .map(PropertyPathItem::getName)
                                .collect(Collectors.toList()),
                        httpEndpoint,
                        clientGeneratorContext,
                        requestParameterSpec.name,
                        propertyOverrideOnRequest,
                        propertyOverrideValueOnRequest);
                setters.stream().map(EnrichedCursorPathSetter::setter).forEach(httpResponseBuilder::addStatement);

                if (!setters.isEmpty()) {
                    EnrichedCursorPathGetter propertyOverrideGetter =
                            setters.get(setters.size() - 1).getter();
                    propertyOverrideOnRequest = propertyOverrideGetter.propertyName();
                    propertyOverrideValueOnRequest = propertyOverrideGetter.propertyName();

                    if (!propertyOverrideGetter.pathItem().optional() && propertyOverrideGetter.optional()) {
                        propertyOverrideValueOnRequest += ".get()";
                    }
                } else {
                    throw new IllegalStateException("There should be at least one setter if the path is nonempty");
                }
            }

            httpResponseBuilder.addStatement(
                    "$T $L = $T.builder().from($L).$L($L).build()",
                    requestParameterSpec.type,
                    variables.getNextRequestVariableName(),
                    requestParameterSpec.type,
                    requestParameterSpec.name,
                    propertyOverrideOnRequest,
                    propertyOverrideValueOnRequest);
            SnippetAndResultType resultSnippet = getNestedPropertySnippet(
                    cursor.getResults().getPropertyPath().map(path -> path.stream()
                            .map(PropertyPathItem::getName)
                            .collect(Collectors.toList())),
                    cursor.getResults().getProperty(),
                    body.getResponseBodyType());

            CodeBlock resultBlock = CodeBlock.builder()
                    .add(
                            "$T $L = $L",
                            resultSnippet.typeName,
                            variables.getResultVariableName(),
                            variables.getParsedResponseVariableName())
                    .add(resultSnippet.codeBlock)
                    .build();
            httpResponseBuilder.addStatement(resultBlock);

            CodeBlock hasNextPageBlock;

            if (nextSnippet.typeReference.getContainer().isPresent()) {
                com.fern.ir.model.types.ContainerType containerType =
                        nextSnippet.typeReference.getContainer().get();
                if (containerType.isOptional()) {
                    hasNextPageBlock = CodeBlock.of("$L.isPresent()", variables.getStartingAfterVariableName());
                } else if (containerType.isNullable()) {
                    hasNextPageBlock = CodeBlock.of("$L != null", variables.getStartingAfterVariableName());
                } else {
                    throw new IllegalStateException(
                            "Found non-optional, non-nullable container as next page token. This should be impossible "
                                    + "due to fern check validation. "
                                    + getContainerDiagnosticString(containerType));
                }
            } else if (nextSnippet.typeReference.getPrimitive().isPresent()) {
                hasNextPageBlock = ZeroValueUtils.isNonzeroValue(
                        variables.getStartingAfterVariableName(),
                        nextSnippet.typeReference.getPrimitive().get());
            } else {
                throw new IllegalStateException(
                        "Found non-optional, non-primitive as next page token. This should be impossible "
                                + "due to fern check validation.");
            }

            TypeName responseType = getResponseType(httpEndpoint, clientGeneratorContext);

            CodeBlock paginationConstructor = CodeBlock.of(
                    "new $T($L, $L, $L, $L)",
                    responseType,
                    hasNextPageBlock,
                    variables.getResultVariableName(),
                    variables.getParsedResponseVariableName(),
                    getNextPageGetter(endpointName, methodParameters));

            handleSuccessfulResult(httpResponseBuilder, paginationConstructor);
            endpointMethodBuilder.returns(responseType);
            return null;
        }

        @Override
        public Void visitOffset(OffsetPagination offset) {
            com.fern.ir.model.types.TypeReference pageType = offset.getPage()
                    .getProperty()
                    .visit(new RequestPropertyValue.Visitor<com.fern.ir.model.types.TypeReference>() {
                        @Override
                        public com.fern.ir.model.types.TypeReference visitQuery(QueryParameter queryParameter) {
                            return queryParameter.getValueType();
                        }

                        @Override
                        public com.fern.ir.model.types.TypeReference visitBody(ObjectProperty objectProperty) {
                            return objectProperty.getValueType();
                        }

                        @Override
                        public com.fern.ir.model.types.TypeReference _visitUnknown(Object o) {
                            throw new IllegalArgumentException("Unknown request property value type.");
                        }
                    });
            Boolean pageIsOptional =
                    pageType.visit(new TypeReferenceUtils.TypeReferenceIsOptional(true, clientGeneratorContext));

            String newNumberFieldNamePascal = offset.getPage()
                    .getProperty()
                    .visit(new RequestPropertyValue.Visitor<String>() {

                        @Override
                        public String visitQuery(QueryParameter queryParameter) {
                            return queryParameter
                                    .getName()
                                    .getName()
                                    .getPascalCase()
                                    .getUnsafeName();
                        }

                        @Override
                        public String visitBody(ObjectProperty objectProperty) {
                            return objectProperty
                                    .getName()
                                    .getName()
                                    .getPascalCase()
                                    .getUnsafeName();
                        }

                        @Override
                        public String _visitUnknown(Object o) {
                            throw new IllegalArgumentException("Unknown request property value type.");
                        }
                    });

            CodeBlock newNumberGetter = CodeBlock.of("$L.get$L()", requestParameterSpec.name, newNumberFieldNamePascal);
            boolean numberGetterOptional = false;

            if (offset.getPage().getPropertyPath().isPresent()
                    && !offset.getPage().getPropertyPath().get().isEmpty()) {
                // NOTE: We don't care about the build-after property names because we're not going to
                // use the setter--just the getter.
                List<EnrichedCursorPathSetter> setters = PaginationPathUtils.getPathSetters(
                        offset.getPage().getPropertyPath().get().stream()
                                .map(PropertyPathItem::getName)
                                .collect(Collectors.toList()),
                        httpEndpoint,
                        clientGeneratorContext,
                        requestParameterSpec.name,
                        "",
                        "");

                if (setters.isEmpty()) {
                    throw new IllegalStateException("There should be at least one setter if the path is nonempty");
                }

                // The 0th getter is what we want here because it contains the pagination index as a
                // property by definition of the path in the IR.
                EnrichedCursorPathGetter getter = setters.get(0).getter();
                if (getter.optional()) {
                    if (pageIsOptional) {
                        newNumberGetter = CodeBlock.of(
                                "$L.flatMap($T::get$L)", getter.getter(), getter.typeName(), newNumberFieldNamePascal);
                    } else {
                        newNumberGetter = CodeBlock.of(
                                "$L.map($T::get$L).get()",
                                getter.getter(),
                                getter.typeName(),
                                newNumberFieldNamePascal);
                    }
                } else {
                    newNumberGetter = CodeBlock.of("$L.get$L", getter.getter(), newNumberFieldNamePascal);
                }
            }

            // Extract the actual underlying type from Optional<> or Nullable<>
            com.fern.ir.model.types.TypeReference numberType;
            if (pageIsOptional
                    && pageType.getContainer().isPresent()
                    && pageType.getContainer().get().isOptional()) {
                numberType = pageType.getContainer().get().getOptional().get();

                if (numberType.getContainer().isPresent()
                        && numberType.getContainer().get().isNullable()) {
                    numberType = numberType.getContainer().get().getNullable().get();
                }
            } else {
                numberType = pageType;
            }

            TypeName numberTypeName =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, numberType);

            String one = INTEGER_ONE;
            if (numberTypeName.equals(TypeName.FLOAT) || numberTypeName.equals(TypeName.DOUBLE)) {
                one = DECIMAL_ONE;
            }

            if (pageIsOptional) {
                String zero = one.equals(DECIMAL_ONE) ? "0.0" : "0";

                TypeName lambdaParamType = numberTypeName;
                if (numberTypeName.isPrimitive()) {
                    lambdaParamType = numberTypeName.box();
                }

                httpResponseBuilder.addStatement(CodeBlock.of(
                        "$T $L = $L.map(($T page) -> page + $L).orElse($L)",
                        numberTypeName,
                        variables.getNewPageNumberVariableName(),
                        newNumberGetter,
                        lambdaParamType,
                        one,
                        one));
            } else {
                httpResponseBuilder.addStatement(CodeBlock.of(
                        "$T $L = $L + $L",
                        clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pageType),
                        variables.getNewPageNumberVariableName(),
                        newNumberGetter,
                        one));
            }

            String propertyOverrideOnRequest = offset.getPage()
                    .getProperty()
                    .visit(new RequestPropertyValue.Visitor<String>() {

                        @Override
                        public String visitQuery(QueryParameter queryParameter) {
                            return queryParameter
                                    .getName()
                                    .getName()
                                    .getCamelCase()
                                    .getUnsafeName();
                        }

                        @Override
                        public String visitBody(ObjectProperty objectProperty) {
                            return objectProperty
                                    .getName()
                                    .getName()
                                    .getCamelCase()
                                    .getUnsafeName();
                        }

                        @Override
                        public String _visitUnknown(Object o) {
                            throw new IllegalArgumentException("Unknown request property value type.");
                        }
                    });
            String propertyOverrideValueOnRequest = variables.getNewPageNumberVariableName();

            if (offset.getPage().getPropertyPath().isPresent()
                    && !offset.getPage().getPropertyPath().get().isEmpty()) {
                List<EnrichedCursorPathSetter> setters = PaginationPathUtils.getPathSetters(
                        offset.getPage().getPropertyPath().get().stream()
                                .map(PropertyPathItem::getName)
                                .collect(Collectors.toList()),
                        httpEndpoint,
                        clientGeneratorContext,
                        requestParameterSpec.name,
                        propertyOverrideOnRequest,
                        propertyOverrideValueOnRequest);
                setters.stream().map(EnrichedCursorPathSetter::setter).forEach(httpResponseBuilder::addStatement);

                if (!setters.isEmpty()) {
                    EnrichedCursorPathGetter propertyOverrideGetter =
                            setters.get(setters.size() - 1).getter();
                    propertyOverrideOnRequest = propertyOverrideGetter.propertyName();
                    propertyOverrideValueOnRequest = propertyOverrideGetter.propertyName();

                    if (!propertyOverrideGetter.pathItem().optional() && propertyOverrideGetter.optional()) {
                        propertyOverrideValueOnRequest += ".get()";
                    }
                } else {
                    throw new IllegalStateException("There should be at least one setter if the path is nonempty");
                }
            }

            httpResponseBuilder.addStatement(
                    "$T $L = $T.builder().from($L).$L($L).build()",
                    requestParameterSpec.type,
                    variables.getNextRequestVariableName(),
                    requestParameterSpec.type,
                    requestParameterSpec.name,
                    propertyOverrideOnRequest,
                    propertyOverrideValueOnRequest);

            SnippetAndResultType resultSnippet = getNestedPropertySnippet(
                    offset.getResults().getPropertyPath().map(path -> path.stream()
                            .map(PropertyPathItem::getName)
                            .collect(Collectors.toList())),
                    offset.getResults().getProperty(),
                    body.getResponseBodyType());
            CodeBlock resultBlock = CodeBlock.builder()
                    .add(
                            "$T $L = $L",
                            resultSnippet.typeName,
                            variables.getResultVariableName(),
                            variables.getParsedResponseVariableName())
                    .add(resultSnippet.codeBlock)
                    .build();
            httpResponseBuilder.addStatement(resultBlock);
            TypeName responseType = getResponseType(httpEndpoint, clientGeneratorContext);

            CodeBlock paginationConstructor = CodeBlock.of(
                    "new $T(true, $L, $L, $L)",
                    responseType,
                    variables.getResultVariableName(),
                    variables.getParsedResponseVariableName(),
                    getNextPageGetter(endpointName, methodParameters));

            handleSuccessfulResult(httpResponseBuilder, paginationConstructor);
            endpointMethodBuilder.returns(responseType);
            return null;
        }

        @Override
        public Void visitCustom(CustomPagination customPagination) {
            // For custom pagination, handle the response as non-paginated
            // and return the parsed response directly. The user is responsible
            // for implementing their own pagination logic.
            TypeName responseType = getResponseType(httpEndpoint, clientGeneratorContext);
            handleSuccessfulResult(httpResponseBuilder, CodeBlock.of("$L", variables.getParsedResponseVariableName()));
            endpointMethodBuilder.returns(responseType);
            return null;
        }

        @Override
        public Void _visitUnknown(Object unknownType) {
            throw new RuntimeException("Unknown pagination type " + unknownType);
        }
    }
}
