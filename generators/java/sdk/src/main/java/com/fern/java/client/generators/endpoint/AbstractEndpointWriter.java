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

import com.fern.ir.model.environment.EnvironmentBaseUrlId;
import com.fern.ir.model.http.*;
import com.fern.ir.model.types.*;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.MultiUrlEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.SingleUrlEnvironmentClass;
import com.fern.java.client.generators.endpoint.HttpUrlBuilder.PathParamInfo;
import com.fern.java.client.generators.visitors.FilePropertyIsOptional;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.JavaDocUtils;
import com.fern.java.utils.TypeReferenceUtils;
import com.squareup.javapoet.ArrayTypeName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.CodeBlock.Builder;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.lang.model.element.Modifier;

public abstract class AbstractEndpointWriter {

    public static final String CONTENT_TYPE_HEADER = "Content-Type";
    public static final String ACCEPT_HEADER = "Accept";
    public static final String APPLICATION_JSON_HEADER = "application/json";
    public static final String APPLICATION_OCTET_STREAM = "application/octet-stream";
    public static final String REQUEST_BUILDER_NAME = "_requestBuilder";
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final GeneratedClientOptions generatedClientOptions;
    private final FieldSpec clientOptionsField;
    private final MethodSpec.Builder endpointMethodBuilder;
    private final GeneratedObjectMapper generatedObjectMapper;
    private final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final boolean inlinePathParams;
    protected final ClientGeneratorContext clientGeneratorContext;
    protected final ClassName baseErrorClassName;
    protected final ClassName apiErrorClassName;
    private final AbstractHttpResponseParserGenerator responseParserGenerator;
    private final HttpEndpointMethodSpecsFactory httpEndpointMethodSpecsFactory;
    protected final AbstractEndpointWriterVariableNameContext variables;

    public AbstractEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            AbstractHttpResponseParserGenerator responseParserGenerator,
            HttpEndpointMethodSpecsFactory httpEndpointMethodSpecsFactory,
            AbstractEndpointWriterVariableNameContext variables,
            ClassName apiErrorClassName,
            ClassName baseErrorClassName) {
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.clientOptionsField = clientOptionsField;
        this.generatedClientOptions = generatedClientOptions;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedObjectMapper = generatedObjectMapper;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.responseParserGenerator = responseParserGenerator;
        this.httpEndpointMethodSpecsFactory = httpEndpointMethodSpecsFactory;
        this.endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.getName().get().getCamelCase().getSafeName())
                .addModifiers(Modifier.PUBLIC);
        this.apiErrorClassName = apiErrorClassName;
        this.baseErrorClassName = baseErrorClassName;
        this.inlinePathParams = clientGeneratorContext.getCustomConfig().inlinePathParameters()
                && httpEndpoint.getSdkRequest().isPresent()
                && httpEndpoint.getSdkRequest().get().getShape().isWrapper()
                && (httpEndpoint
                                .getSdkRequest()
                                .get()
                                .getShape()
                                .getWrapper()
                                .get()
                                .getIncludePathParameters()
                                .orElse(false)
                        || httpEndpoint
                                .getSdkRequest()
                                .get()
                                .getShape()
                                .getWrapper()
                                .get()
                                .getOnlyPathParameters()
                                .orElse(false));
        this.variables = variables;
    }

    public static CodeBlock stringify(String reference, TypeName typeName) {
        if (typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).typeArguments.get(0).equals(ClassName.get(String.class))) {
            return CodeBlock.of(reference);
        } else if (typeName.equals(ClassName.get(String.class))) {
            return CodeBlock.of(reference);
        } else if (typeName.equals(TypeName.DOUBLE)) {
            return CodeBlock.of("$T.toString($L)", Double.class, reference);
        } else if (typeName.equals(TypeName.INT)) {
            return CodeBlock.of("$T.toString($L)", Integer.class, reference);
        } else if (typeName.equals(TypeName.LONG)) {
            return CodeBlock.of("$T.toString($L)", Long.class, reference);
        } else if (typeName.equals(TypeName.BOOLEAN)) {
            return CodeBlock.of("$T.toString($L)", Boolean.class, reference);
        } else {
            return CodeBlock.of("$L.toString()", reference);
        }
    }

    private static boolean typeNameIsOptional(TypeName typeName) {
        return typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class));
    }

    public final HttpEndpointMethodSpecs generate() {
        // Step 1: Populate JavaDoc
        if (httpEndpoint.getDocs().isPresent()) {
            endpointMethodBuilder.addJavadoc(
                    JavaDocUtils.render(httpEndpoint.getDocs().get(), true));
        }

        // Step 2: Add additional parameters
        List<ParameterSpec> additionalParameters = variables.additionalParameters();

        // Step 3: Add parameters
        endpointMethodBuilder.addParameters(variables.pathParameters);
        endpointMethodBuilder.addParameters(additionalParameters);
        if (httpEndpoint.getIdempotent()) {
            endpointMethodBuilder.addParameter(ParameterSpec.builder(
                            clientGeneratorContext.getPoetClassNameFactory().getIdempotentRequestOptionsClassName(),
                            AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME)
                    .build());
        } else {
            endpointMethodBuilder.addParameter(requestOptionsParameterSpec());
        }

        // Step 4: Get http client initializer
        HttpUrlBuilder httpUrlBuilder = new HttpUrlBuilder(
                variables.getHttpUrlName(),
                variables
                        .sdkRequest()
                        .map(sdkRequest -> sdkRequest
                                .getRequestParameterName()
                                .getCamelCase()
                                .getSafeName())
                        .orElse(null),
                clientOptionsField,
                generatedClientOptions,
                CodeBlock.of(
                        "this.$L.$N().$L()",
                        clientOptionsField.name,
                        generatedClientOptions.environment(),
                        getEnvironmentToUrlMethod().name),
                httpEndpoint,
                httpService,
                convertPathParametersToSpecMap(httpService.getPathParameters()),
                convertPathParametersToSpecMap(httpEndpoint.getPathParameters()),
                clientGeneratorContext);
        HttpUrlBuilder.GeneratedHttpUrl generatedHttpUrl = httpUrlBuilder.generateBuilder(variables.getQueryParams());
        endpointMethodBuilder.addCode(generatedHttpUrl.initialization());

        // Step 5: Get request initializer
        boolean sendContentType = httpEndpoint.getRequestBody().isPresent();
        String contentType = httpEndpoint
                .getRequestBody()
                .flatMap(body -> body.visit(new HttpRequestBody.Visitor<Optional<String>>() {
                    @Override
                    public Optional<String> visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                        return inlinedRequestBody.getContentType();
                    }

                    @Override
                    public Optional<String> visitReference(HttpRequestBodyReference httpRequestBodyReference) {
                        return httpRequestBodyReference.getContentType();
                    }

                    @Override
                    public Optional<String> visitFileUpload(FileUploadRequest fileUploadRequest) {
                        // N.B. File upload headers are obtained from request configuration.
                        return Optional.empty();
                    }

                    @Override
                    public Optional<String> visitBytes(BytesRequest bytesRequest) {
                        return bytesRequest.getContentType();
                    }

                    @Override
                    public Optional<String> _visitUnknown(Object o) {
                        throw new IllegalArgumentException("Unknown request type.");
                    }
                }))
                .orElse(AbstractEndpointWriter.APPLICATION_JSON_HEADER);
        CodeBlock requestInitializer = getInitializeRequestCodeBlock(
                clientOptionsField,
                generatedClientOptions,
                httpEndpoint,
                contentType,
                generatedObjectMapper,
                generatedHttpUrl.inlineableBuild(),
                sendContentType);
        endpointMethodBuilder.addCode(requestInitializer);

        // Step 6: Make http request and handle responses
        CodeBlock responseParser = responseParserGenerator.getResponseParserCodeBlock(endpointMethodBuilder);
        endpointMethodBuilder.addCode(responseParser);

        MethodSpec endpointWithRequestOptions = endpointMethodBuilder.build();

        List<String> paramNames = Stream.concat(variables.pathParameters.stream(), additionalParameters.stream())
                .map(parameterSpec -> parameterSpec.name)
                .collect(Collectors.toList());
        paramNames.add("null");
        MethodSpec.Builder endpointWithoutRequestOptionsBuilder = MethodSpec.methodBuilder(
                        endpointWithRequestOptions.name)
                .addModifiers(Modifier.PUBLIC)
                .addParameters(variables.pathParameters)
                .addParameters(additionalParameters)
                .addJavadoc(endpointWithRequestOptions.javadoc);

        responseParserGenerator.addEndpointWithoutRequestOptionsReturnStatement(
                endpointWithoutRequestOptionsBuilder, endpointWithRequestOptions, paramNames);

        MethodSpec endpointWithoutRequestOptions = endpointWithoutRequestOptionsBuilder
                .returns(endpointWithRequestOptions.returnType)
                .build();

        MethodSpec endpointWithoutRequest = null;
        if (variables.sdkRequest().isPresent()
                && variables.sdkRequest().get().getShape().visit(new SdkRequestIsOptional())) {
            MethodSpec.Builder endpointWithoutRequestBuilder = MethodSpec.methodBuilder(endpointWithRequestOptions.name)
                    .addJavadoc(endpointWithRequestOptions.javadoc)
                    .addModifiers(Modifier.PUBLIC)
                    .addParameters(variables.pathParameters)
                    .returns(endpointWithoutRequestOptions.returnType);
            List<ParameterSpec> additionalParamsWithoutBody = additionalParameters.stream()
                    .filter(parameterSpec -> !parameterSpec.name.equals(variables
                            .sdkRequest()
                            .get()
                            .getRequestParameterName()
                            .getCamelCase()
                            .getUnsafeName()))
                    .collect(Collectors.toList());
            endpointWithoutRequestBuilder.addParameters(additionalParamsWithoutBody);
            List<String> paramNamesWoBody = Stream.concat(
                            variables.pathParameters.stream(), additionalParamsWithoutBody.stream())
                    .map(parameterSpec -> parameterSpec.name)
                    .collect(Collectors.toList());
            ParameterSpec bodyParameterSpec = additionalParameters.stream()
                    .filter(parameterSpec -> parameterSpec.name.equals(variables
                            .sdkRequest()
                            .get()
                            .getRequestParameterName()
                            .getCamelCase()
                            .getUnsafeName()))
                    .collect(Collectors.toList())
                    .get(0);
            if (typeNameIsOptional(bodyParameterSpec.type)) {
                paramNamesWoBody.add("Optional.empty()");
            } else {
                paramNamesWoBody.add("$T.builder().build()");
            }
            responseParserGenerator.addEndpointWithoutRequestReturnStatement(
                    endpointWithoutRequestBuilder, endpointWithRequestOptions, paramNamesWoBody, bodyParameterSpec);
            endpointWithoutRequest = endpointWithoutRequestBuilder.build();
        }
        Optional<BytesRequest> maybeBytes = httpEndpoint
                .getSdkRequest()
                .flatMap(
                        sdkRequest -> sdkRequest.getShape().getJustRequestBody().flatMap(SdkRequestBodyType::getBytes));
        MethodSpec nonRequestOptionsByteArrayMethodSpec = null;
        MethodSpec byteArrayMethodSpec = null;

        // add direct byte array endpoints for backwards compatibility
        if (maybeBytes.isPresent()) {
            BytesRequest bytes = maybeBytes.get();
            ParameterSpec requestParameterSpec = variables.getBytesRequestParameterSpec(
                    bytes, variables.sdkRequest().get(), ArrayTypeName.of(byte.class));
            MethodSpec byteArrayBaseMethodSpec = MethodSpec.methodBuilder(endpointWithRequestOptions.name)
                    .addModifiers(Modifier.PUBLIC)
                    .addParameters(variables.pathParameters)
                    .addParameters(List.of(requestParameterSpec))
                    .addJavadoc(endpointWithRequestOptions.javadoc)
                    .returns(endpointWithRequestOptions.returnType)
                    .build();
            Builder methodBodyBuilder = CodeBlock.builder();
            CodeBlock baseMethodBody = responseParserGenerator.getByteArrayEndpointBaseMethodBody(
                    methodBodyBuilder, byteArrayBaseMethodSpec, requestParameterSpec, endpointWithRequestOptions);
            nonRequestOptionsByteArrayMethodSpec = byteArrayBaseMethodSpec.toBuilder()
                    .addStatement(baseMethodBody.toBuilder().add(")").build())
                    .build();
            byteArrayMethodSpec = byteArrayBaseMethodSpec.toBuilder()
                    .addParameter(requestOptionsParameterSpec())
                    .addStatement(baseMethodBody.toBuilder()
                            .add(", $L)", AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME)
                            .build())
                    .build();
        }

        return httpEndpointMethodSpecsFactory.create(
                endpointWithRequestOptions,
                endpointWithoutRequestOptions,
                endpointWithoutRequest,
                byteArrayMethodSpec,
                nonRequestOptionsByteArrayMethodSpec);
    }

    public abstract CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint endpoint,
            String contentType,
            GeneratedObjectMapper objectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType);

    public final ParameterSpec requestOptionsParameterSpec() {
        return ParameterSpec.builder(
                        clientGeneratorContext.getPoetClassNameFactory().getRequestOptionsClassName(),
                        AbstractEndpointWriterVariableNameContext.REQUEST_OPTIONS_PARAMETER_NAME)
                .build();
    }

    protected final MethodSpec getEnvironmentToUrlMethod() {
        if (generatedEnvironmentsClass.info() instanceof SingleUrlEnvironmentClass) {
            return ((SingleUrlEnvironmentClass) generatedEnvironmentsClass.info()).getUrlMethod();
        } else if (generatedEnvironmentsClass.info() instanceof MultiUrlEnvironmentsClass) {
            EnvironmentBaseUrlId environmentBaseUrlId =
                    httpEndpoint.getBaseUrl().get();
            return ((MultiUrlEnvironmentsClass) generatedEnvironmentsClass.info())
                    .urlGetterMethods()
                    .get(environmentBaseUrlId);
        } else {
            throw new RuntimeException("Generated Environments class was unknown : " + generatedEnvironmentsClass);
        }
    }

    private Map<String, PathParamInfo> convertPathParametersToSpecMap(List<PathParameter> pathParameters) {
        return pathParameters.stream()
                .collect(Collectors.toMap(
                        pathParameter -> pathParameter.getName().getOriginalName(), this::convertPathParameter));
    }

    private PathParamInfo convertPathParameter(PathParameter pathParameter) {
        TypeName typeName =
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParameter.getValueType());
        ParameterSpec.Builder paramBuilder = ParameterSpec.builder(
                typeName, pathParameter.getName().getCamelCase().getSafeName());

        return PathParamInfo.builder()
                .irParam(pathParameter)
                .poetParam(paramBuilder.build())
                .build();
    }

    private class SdkRequestIsOptional implements SdkRequestShape.Visitor<Boolean> {

        @Override
        public Boolean visitJustRequestBody(SdkRequestBodyType justRequestBody) {
            return justRequestBody.visit(new SdkRequestBodyType.Visitor<Boolean>() {
                @Override
                public Boolean visitTypeReference(HttpRequestBodyReference typeReference) {
                    return typeReference
                            .getRequestBodyType()
                            .visit(new TypeReferenceUtils.TypeReferenceIsOptional(true, clientGeneratorContext));
                }

                @Override
                public Boolean visitBytes(BytesRequest bytes) {
                    return bytes.getIsOptional();
                }

                @Override
                public Boolean _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Encountered unknown type " + unknownType);
                }
            });
        }

        @Override
        public Boolean visitWrapper(SdkRequestWrapper wrapper) {
            boolean isOptional = true;
            if (httpEndpoint.getRequestBody().isPresent()) {
                isOptional = httpEndpoint.getRequestBody().get().visit(new HttpRequestBodyIsOptional());
            }
            if (!httpEndpoint.getHeaders().isEmpty() && isOptional) {
                isOptional = httpEndpoint.getHeaders().stream().allMatch(httpHeader -> httpHeader
                        .getValueType()
                        .visit(new TypeReferenceUtils.TypeReferenceIsOptional(false, clientGeneratorContext)));
            }
            if (!httpEndpoint.getQueryParameters().isEmpty() && isOptional) {
                isOptional = httpEndpoint.getQueryParameters().stream().allMatch(queryParameter -> queryParameter
                        .getValueType()
                        .visit(new TypeReferenceUtils.TypeReferenceIsOptional(false, clientGeneratorContext)));
            }
            if (!httpEndpoint.getPathParameters().isEmpty() && inlinePathParams && isOptional) {
                isOptional = httpEndpoint.getPathParameters().stream().allMatch(pathParameter -> pathParameter
                        .getValueType()
                        .visit(new TypeReferenceUtils.TypeReferenceIsOptional(false, clientGeneratorContext)));
            }
            return isOptional;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    class HttpRequestBodyIsOptional implements HttpRequestBody.Visitor<Boolean> {

        @Override
        public Boolean visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
            boolean allPropertiesOptional = inlinedRequestBody.getProperties().stream()
                    .allMatch(objectProperty -> objectProperty
                            .getValueType()
                            .visit(new TypeReferenceUtils.TypeReferenceIsOptional(false, clientGeneratorContext)));
            boolean allExtendsAreOptional = inlinedRequestBody.getExtends().stream()
                    .allMatch(declaredTypeName -> {
                        TypeDeclaration typeDeclaration =
                                clientGeneratorContext.getTypeDeclarations().get(declaredTypeName.getTypeId());
                        return typeDeclaration
                                .getShape()
                                .visit(new TypeReferenceUtils.TypeDeclarationIsOptional(clientGeneratorContext));
                    });
            return allPropertiesOptional && allExtendsAreOptional;
        }

        @Override
        public Boolean visitReference(HttpRequestBodyReference reference) {
            return reference
                    .getRequestBodyType()
                    .visit(new TypeReferenceUtils.TypeReferenceIsOptional(false, clientGeneratorContext));
        }

        @Override
        public Boolean visitFileUpload(FileUploadRequest fileUpload) {
            return fileUpload.getProperties().stream()
                    .allMatch(fileUploadRequestProperty ->
                            fileUploadRequestProperty.visit(new FileUploadRequestPropertyIsOptional()));
        }

        @Override
        public Boolean visitBytes(BytesRequest bytes) {
            return bytes.getIsOptional();
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    private class FileUploadRequestPropertyIsOptional implements FileUploadRequestProperty.Visitor<Boolean> {

        @Override
        public Boolean visitFile(FileProperty file) {
            return file.visit(new FilePropertyIsOptional());
        }

        @Override
        public Boolean visitBodyProperty(FileUploadBodyProperty bodyProperty) {
            return bodyProperty
                    .getValueType()
                    .visit(new TypeReferenceUtils.TypeReferenceIsOptional(false, clientGeneratorContext));
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    public static Optional<CodeBlock> maybeAcceptsHeader(HttpEndpoint httpEndpoint) {
        Set<String> contentTypes = new HashSet<>();

        // TODO: We'll need to get error content types from the IR once they're available.
        if (!httpEndpoint.getErrors().get().isEmpty()) {
            contentTypes.add(APPLICATION_JSON_HEADER);
        }

        responseContentType(httpEndpoint.getResponse()).ifPresent(contentTypes::add);

        if (contentTypes.isEmpty()) {
            return Optional.empty();
        }

        String headerValue = String.join("; ", contentTypes);
        return Optional.of(CodeBlock.of(".addHeader($S, $S)", ACCEPT_HEADER, headerValue));
    }

    public static Optional<String> responseContentType(Optional<HttpResponse> response) {
        if (response.isEmpty()) {
            return Optional.empty();
        }

        Optional<HttpResponseBody> body = response.get().getBody();

        if (body.isEmpty()) {
            return Optional.empty();
        }

        return body.get().visit(new HttpResponseBody.Visitor<Optional<String>>() {
            @Override
            public Optional<String> visitJson(JsonResponse jsonResponse) {
                return Optional.of(APPLICATION_JSON_HEADER);
            }

            @Override
            public Optional<String> visitFileDownload(FileDownloadResponse fileDownloadResponse) {
                // TODO: We'll probably need to get this from the IR if we want accepts here
                return Optional.empty();
            }

            @Override
            public Optional<String> visitText(TextResponse textResponse) {
                // TODO: Figure out if the right thing to do is text/plain here or if we want something more granular
                return Optional.empty();
            }

            @Override
            public Optional<String> visitBytes(BytesResponse bytesResponse) {
                // TODO: At some point it may be necessary to apply application/octet-stream, although it's best to
                //  wait for the IR change.
                return Optional.empty();
            }

            @Override
            public Optional<String> visitStreaming(StreamingResponse streamingResponse) {
                // TODO: At some point it may be necessary to apply text/event-stream, application/x-ndjson or others
                //  although it's best to wait for the IR change.
                return Optional.empty();
            }

            @Override
            public Optional<String> visitStreamParameter(StreamParameterResponse streamParameterResponse) {
                // TODO: At some point it may be necessary to apply text/event-stream, application/x-ndjson or others
                //  although it's best to wait for the IR change.
                return Optional.empty();
            }

            @Override
            public Optional<String> _visitUnknown(Object o) {
                return Optional.empty();
            }
        });
    }
}
