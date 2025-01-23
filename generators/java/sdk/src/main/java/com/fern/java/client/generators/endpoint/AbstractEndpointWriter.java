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
import com.fasterxml.jackson.core.type.TypeReference;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.environment.EnvironmentBaseUrlId;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.http.*;
import com.fern.ir.model.http.Pagination.Visitor;
import com.fern.ir.model.types.*;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.MultiUrlEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.SingleUrlEnvironmentClass;
import com.fern.java.client.generators.endpoint.HttpUrlBuilder.PathParamInfo;
import com.fern.java.client.generators.visitors.FilePropertyIsOptional;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.JavaDocUtils;
import com.fern.java.utils.TypeReferenceUtils.ContainerTypeToUnderlyingType;
import com.squareup.javapoet.ArrayTypeName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.CodeBlock.Builder;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.lang.model.element.Modifier;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import okhttp3.ResponseBody;

public abstract class AbstractEndpointWriter {

    public static final String CONTENT_TYPE_HEADER = "Content-Type";
    public static final String ACCEPT_HEADER = "Accept";
    public static final String APPLICATION_JSON_HEADER = "application/json";
    public static final String APPLICATION_OCTET_STREAM = "application/octet-stream";
    public static final String REQUEST_BUILDER_NAME = "_requestBuilder";
    public static final String REQUEST_OPTIONS_PARAMETER_NAME = "requestOptions";
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final GeneratedClientOptions generatedClientOptions;
    private final FieldSpec clientOptionsField;
    private final ClientGeneratorContext clientGeneratorContext;
    private final MethodSpec.Builder endpointMethodBuilder;
    private final GeneratedObjectMapper generatedObjectMapper;
    private final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final Set<String> endpointParameterNames = new HashSet<>();
    protected final ClassName baseErrorClassName;
    protected final ClassName apiErrorClassName;
    private final Map<ErrorId, GeneratedJavaFile> generatedErrors;
    private final boolean inlinePathParams;

    public AbstractEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.clientOptionsField = clientOptionsField;
        this.generatedClientOptions = generatedClientOptions;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedObjectMapper = generatedObjectMapper;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.getName().get().getCamelCase().getSafeName())
                .addModifiers(Modifier.PUBLIC);
        this.baseErrorClassName = clientGeneratorContext
                .getPoetClassNameFactory()
                .getBaseExceptionClassName(
                        clientGeneratorContext.getGeneratorConfig().getOrganization(),
                        clientGeneratorContext.getGeneratorConfig().getWorkspaceName(),
                        clientGeneratorContext.getCustomConfig());
        this.apiErrorClassName = clientGeneratorContext
                .getPoetClassNameFactory()
                .getApiErrorClassName(
                        clientGeneratorContext.getGeneratorConfig().getOrganization(),
                        clientGeneratorContext.getGeneratorConfig().getWorkspaceName(),
                        clientGeneratorContext.getCustomConfig());
        this.generatedErrors = generatedErrors;
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
        } else {
            return CodeBlock.of("$L.toString()", reference);
        }
    }

    private static boolean typeNameIsOptional(TypeName typeName) {
        return typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class));
    }

    public final HttpEndpointMethodSpecs generate() {
        // Step 0: Populate JavaDoc
        if (httpEndpoint.getDocs().isPresent()) {
            endpointMethodBuilder.addJavadoc(
                    JavaDocUtils.render(httpEndpoint.getDocs().get(), true));
        }

        // Step 1: Add Path Params as parameters
        List<PathParamInfo> pathParamInfos = getPathParamInfos();
        if (inlinePathParams) {
            pathParamInfos = pathParamInfos.stream()
                    .filter(param -> !param.irParam().getLocation().equals(PathParameterLocation.ENDPOINT))
                    .collect(Collectors.toList());
        }
        List<ParameterSpec> pathParameters =
                pathParamInfos.stream().map(PathParamInfo::poetParam).collect(Collectors.toList());

        // populate all param names
        this.endpointParameterNames.addAll(
                pathParameters.stream().map(parameterSpec -> parameterSpec.name).collect(Collectors.toList()));
        this.endpointParameterNames.addAll(additionalParameters().stream()
                .map(parameterSpec -> parameterSpec.name)
                .collect(Collectors.toList()));
        this.endpointParameterNames.add(REQUEST_OPTIONS_PARAMETER_NAME);

        // Step 2: Add additional parameters
        List<ParameterSpec> additionalParameters = additionalParameters();

        // Step 3: Add parameters
        endpointMethodBuilder.addParameters(pathParameters);
        endpointMethodBuilder.addParameters(additionalParameters);
        if (httpEndpoint.getIdempotent()) {
            endpointMethodBuilder.addParameter(ParameterSpec.builder(
                            clientGeneratorContext.getPoetClassNameFactory().getIdempotentRequestOptionsClassName(),
                            REQUEST_OPTIONS_PARAMETER_NAME)
                    .build());
        } else {
            endpointMethodBuilder.addParameter(requestOptionsParameterSpec());
        }

        // Step 4: Get http client initializer
        HttpUrlBuilder httpUrlBuilder = new HttpUrlBuilder(
                getHttpUrlName(),
                sdkRequest()
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
                clientGeneratorContext.getCustomConfig());
        HttpUrlBuilder.GeneratedHttpUrl generatedHttpUrl = httpUrlBuilder.generateBuilder(getQueryParams());
        endpointMethodBuilder.addCode(generatedHttpUrl.initialization());

        // Step 5: Get request initializer
        boolean sendContentType = httpEndpoint.getRequestBody().isPresent()
                || (httpEndpoint.getResponse().isPresent()
                        && httpEndpoint.getResponse().get().getBody().isPresent());
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
                generatedHttpUrl.inlinableBuild(),
                sendContentType);
        endpointMethodBuilder.addCode(requestInitializer);

        // Step 6: Make http request and handle responses
        CodeBlock responseParser = getResponseParserCodeBlock();
        endpointMethodBuilder.addCode(responseParser);

        MethodSpec endpointWithRequestOptions = endpointMethodBuilder.build();

        List<String> paramNames = Stream.concat(pathParameters.stream(), additionalParameters.stream())
                .map(parameterSpec -> parameterSpec.name)
                .collect(Collectors.toList());
        paramNames.add("null");
        MethodSpec endpointWithoutRequestOptions = MethodSpec.methodBuilder(endpointWithRequestOptions.name)
                .addModifiers(Modifier.PUBLIC)
                .addParameters(pathParameters)
                .addParameters(additionalParameters)
                .addJavadoc(endpointWithRequestOptions.javadoc)
                .addStatement(
                        endpointWithRequestOptions.returnType.equals(TypeName.VOID)
                                ? endpointWithRequestOptions.name + "(" + String.join(",", paramNames) + ")"
                                : "return " + endpointWithRequestOptions.name + "(" + String.join(",", paramNames)
                                        + ")",
                        endpointWithRequestOptions.name)
                .returns(endpointWithRequestOptions.returnType)
                .build();

        MethodSpec endpointWithoutRequest = null;
        if (sdkRequest().isPresent() && sdkRequest().get().getShape().visit(new SdkRequestIsOptional())) {
            MethodSpec.Builder endpointWithoutRequestBldr = MethodSpec.methodBuilder(endpointWithRequestOptions.name)
                    .addJavadoc(endpointWithRequestOptions.javadoc)
                    .addModifiers(Modifier.PUBLIC)
                    .addParameters(pathParameters)
                    .returns(endpointWithoutRequestOptions.returnType);
            List<ParameterSpec> additionalParamsWithoutBody = additionalParameters.stream()
                    .filter(parameterSpec -> !parameterSpec.name.equals(sdkRequest()
                            .get()
                            .getRequestParameterName()
                            .getCamelCase()
                            .getUnsafeName()))
                    .collect(Collectors.toList());
            endpointWithoutRequestBldr.addParameters(additionalParamsWithoutBody);
            List<String> paramNamesWoBody = Stream.concat(pathParameters.stream(), additionalParamsWithoutBody.stream())
                    .map(parameterSpec -> parameterSpec.name)
                    .collect(Collectors.toList());
            ParameterSpec bodyParameterSpec = additionalParameters.stream()
                    .filter(parameterSpec -> parameterSpec.name.equals(sdkRequest()
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
            endpointWithoutRequest = endpointWithoutRequestBldr
                    .addStatement(
                            endpointWithRequestOptions.returnType.equals(TypeName.VOID)
                                    ? endpointWithRequestOptions.name + "(" + String.join(",", paramNamesWoBody) + ")"
                                    : "return " + endpointWithRequestOptions.name + "("
                                            + String.join(",", paramNamesWoBody) + ")",
                            bodyParameterSpec.type)
                    .build();
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
            ParameterSpec requestParameterSpec =
                    getBytesRequestParameterSpec(bytes, sdkRequest().get(), ArrayTypeName.of(byte.class));
            MethodSpec byteArrayBaseMethodSpec = MethodSpec.methodBuilder(endpointWithRequestOptions.name)
                    .addModifiers(Modifier.PUBLIC)
                    .addParameters(pathParameters)
                    .addParameters(List.of(requestParameterSpec))
                    .addJavadoc(endpointWithRequestOptions.javadoc)
                    .returns(endpointWithRequestOptions.returnType)
                    .build();
            Builder methodBodyBuilder = CodeBlock.builder();
            if (!byteArrayBaseMethodSpec.returnType.equals(TypeName.VOID)) {
                methodBodyBuilder.add("return ");
            }
            CodeBlock baseMethodBody = methodBodyBuilder
                    .add(
                            "$L(new $T($L)",
                            endpointWithRequestOptions.name,
                            ByteArrayInputStream.class,
                            requestParameterSpec.name)
                    .build();
            nonRequestOptionsByteArrayMethodSpec = byteArrayBaseMethodSpec.toBuilder()
                    .addStatement(baseMethodBody.toBuilder().add(")").build())
                    .build();
            byteArrayMethodSpec = byteArrayBaseMethodSpec.toBuilder()
                    .addParameter(requestOptionsParameterSpec())
                    .addStatement(baseMethodBody.toBuilder()
                            .add(", $L)", REQUEST_OPTIONS_PARAMETER_NAME)
                            .build())
                    .build();
        }

        return new HttpEndpointMethodSpecs(
                endpointWithRequestOptions,
                endpointWithoutRequestOptions,
                endpointWithoutRequest,
                byteArrayMethodSpec,
                nonRequestOptionsByteArrayMethodSpec);
    }

    public abstract Optional<SdkRequest> sdkRequest();

    public abstract List<EnrichedObjectProperty> getQueryParams();

    public abstract List<ParameterSpec> additionalParameters();

    public abstract Optional<ParameterSpec> requestParameterSpec();

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
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .build();
    }

    protected final ParameterSpec getBytesRequestParameterSpec(
            BytesRequest bytes, SdkRequest sdkRequest, TypeName typeName) {
        if (bytes.getIsOptional()) {
            typeName = ParameterizedTypeName.get(ClassName.get(Optional.class), typeName);
        }
        return ParameterSpec.builder(
                        typeName,
                        sdkRequest.getRequestParameterName().getCamelCase().getSafeName())
                .build();
    }

    public final CodeBlock getResponseParserCodeBlock() {
        CodeBlock.Builder httpResponseBuilder = CodeBlock.builder()
                // Default the request client
                .addStatement(
                        "$T $L = $N.$N()",
                        OkHttpClient.class,
                        getDefaultedClientName(),
                        clientOptionsField,
                        generatedClientOptions.httpClient())
                .beginControlFlow(
                        "if ($L != null && $L.getTimeout().isPresent())",
                        REQUEST_OPTIONS_PARAMETER_NAME,
                        REQUEST_OPTIONS_PARAMETER_NAME)
                // Set the client's callTimeout if requestOptions overrides it has one
                .addStatement(
                        "$L = $N.$N($L)",
                        getDefaultedClientName(),
                        clientOptionsField,
                        generatedClientOptions.httpClientWithTimeout(),
                        REQUEST_OPTIONS_PARAMETER_NAME)
                .endControlFlow();
        if (httpEndpoint.getResponse().isPresent()
                && httpEndpoint.getResponse().get().getBody().isPresent()) {
            httpEndpoint
                    .getResponse()
                    .get()
                    .getBody()
                    .get()
                    .visit(new SuccessResponseWriter(
                            httpResponseBuilder, endpointMethodBuilder, clientGeneratorContext, generatedObjectMapper));
        } else {
            addTryWithResourcesVariant(httpResponseBuilder);
            httpResponseBuilder.addStatement("return");
        }
        httpResponseBuilder.endControlFlow();
        httpResponseBuilder.addStatement(
                "$T $L = $L != null ? $L.string() : $S",
                String.class,
                getResponseBodyStringName(),
                getResponseBodyName(),
                getResponseBodyName(),
                "{}");

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
                    httpResponseBuilder.beginControlFlow("switch ($L.code())", getResponseName());
                }
                errorDeclarations.forEach(errorDeclaration -> {
                    GeneratedJavaFile generatedError =
                            generatedErrors.get(errorDeclaration.getName().getErrorId());
                    ClassName errorClassName = generatedError.getClassName();
                    Optional<TypeName> bodyTypeName = errorDeclaration
                            .getType()
                            .map(typeReference -> clientGeneratorContext
                                    .getPoetTypeNameMapper()
                                    .convertToTypeName(true, typeReference));
                    if (multipleErrors) {
                        httpResponseBuilder.add("case $L:", errorDeclaration.getStatusCode());
                    } else {
                        httpResponseBuilder.beginControlFlow(
                                "if ($L.code() == $L)", getResponseName(), errorDeclaration.getStatusCode());
                    }
                    httpResponseBuilder.addStatement(
                            "throw new $T($T.$L.readValue($L, $T.class))",
                            errorClassName,
                            generatedObjectMapper.getClassName(),
                            generatedObjectMapper.jsonMapperStaticField().name,
                            getResponseBodyStringName(),
                            bodyTypeName.orElse(TypeName.get(Object.class)));
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
                "throw new $T($S + $L.code(), $L.code(), $T.$L.readValue($L, $T.class))",
                apiErrorClassName,
                "Error with status code ",
                getResponseName(),
                getResponseName(),
                generatedObjectMapper.getClassName(),
                generatedObjectMapper.jsonMapperStaticField().name,
                getResponseBodyStringName(),
                Object.class);
        httpResponseBuilder
                .endControlFlow()
                .beginControlFlow("catch ($T e)", IOException.class)
                .addStatement("throw new $T($S, e)", baseErrorClassName, "Network error executing HTTP request")
                .endControlFlow()
                .build();
        return httpResponseBuilder.build();
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

    private void addNonTryWithResourcesVariant(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder
                .beginControlFlow("try")
                .addStatement(
                        "$T $L = $N.newCall($L).execute()",
                        Response.class,
                        getResponseName(),
                        getDefaultedClientName(),
                        getOkhttpRequestName())
                .addStatement("$T $L = $N.body()", ResponseBody.class, getResponseBodyName(), getResponseName())
                .beginControlFlow("if ($L.isSuccessful())", getResponseName());
    }

    private void addTryWithResourcesVariant(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder
                .beginControlFlow(
                        "try ($T $L = $N.newCall($L).execute())",
                        Response.class,
                        getResponseName(),
                        getDefaultedClientName(),
                        getOkhttpRequestName())
                .addStatement("$T $L = $N.body()", ResponseBody.class, getResponseBodyName(), getResponseName())
                .beginControlFlow("if ($L.isSuccessful())", getResponseName());
    }

    public final String getVariableName(String variable) {
        if (this.endpointParameterNames.contains(variable)) {
            return "_" + variable;
        }
        return variable;
    }

    private String getDefaultedClientName() {
        return "client";
    }

    private String getHttpUrlName() {
        if (this.endpointParameterNames.contains("httpUrl")) {
            return "_httpUrl";
        }
        return "httpUrl";
    }

    private String getResponseName() {
        if (this.endpointParameterNames.contains("response")) {
            return "_response";
        }
        return "response";
    }

    private String getResponseBodyName() {
        return getVariableName("responseBody");
    }

    private String getParsedResponseVariableName() {
        return getVariableName("parsedResponse");
    }

    private String getResponseBodyStringName() {
        return getVariableName("responseBodyString");
    }

    protected final String getOkhttpRequestName() {
        if (this.endpointParameterNames.contains("okhttpRequest")) {
            return "_okhttpRequest";
        }
        return "okhttpRequest";
    }

    protected final String getRequestBodyPropertiesName() {
        if (this.endpointParameterNames.contains("properties")) {
            return "_properties";
        }
        return "properties";
    }

    protected final String getOkhttpRequestBodyName() {
        if (this.endpointParameterNames.contains("body")) {
            return "_body";
        }
        return "body";
    }

    protected final String getMultipartBodyPropertiesName() {
        return getVariableName("body");
    }

    protected final String getStartingAfterVariableName() {
        return getVariableName("startingAfter");
    }

    protected final String getNextRequestVariableName() {
        return getVariableName("nextRequest");
    }

    protected final String getResultVariableName() {
        return getVariableName("result");
    }

    protected final String getNewPageNumberVariableName() {
        return getVariableName("newPageNumber");
    }

    private List<PathParamInfo> getPathParamInfos() {
        List<PathParamInfo> pathParamInfos = new ArrayList<>();
        httpService.getPathParameters().forEach(pathParameter -> {
            if (pathParameter.getVariable().isPresent()) {
                return;
            }
            pathParamInfos.add(convertPathParameter(pathParameter));
        });
        httpEndpoint.getPathParameters().forEach(pathParameter -> {
            if (pathParameter.getVariable().isPresent()) {
                return;
            }
            pathParamInfos.add(convertPathParameter(pathParameter));
        });
        return pathParamInfos;
    }

    private List<ParameterSpec> getPathParameters() {
        return getPathParamInfos().stream().map(PathParamInfo::poetParam).collect(Collectors.toList());
    }

    private Map<String, PathParamInfo> convertPathParametersToSpecMap(List<PathParameter> pathParameters) {
        return pathParameters.stream()
                .collect(Collectors.toMap(
                        pathParameter -> pathParameter.getName().getOriginalName(), this::convertPathParameter));
    }

    private PathParamInfo convertPathParameter(PathParameter pathParameter) {
        return PathParamInfo.builder()
                .irParam(pathParameter)
                .poetParam(ParameterSpec.builder(
                                clientGeneratorContext
                                        .getPoetTypeNameMapper()
                                        .convertToTypeName(true, pathParameter.getValueType()),
                                pathParameter.getName().getCamelCase().getSafeName())
                        .build())
                .build();
    }

    private final class SuccessResponseWriter implements HttpResponseBody.Visitor<Void> {

        private final com.squareup.javapoet.CodeBlock.Builder httpResponseBuilder;
        private final MethodSpec.Builder endpointMethodBuilder;
        private final GeneratedObjectMapper generatedObjectMapper;
        private final ClientGeneratorContext clientGeneratorContext;

        SuccessResponseWriter(
                Builder httpResponseBuilder,
                MethodSpec.Builder endpointMethodBuilder,
                ClientGeneratorContext clientGeneratorContext,
                GeneratedObjectMapper generatedObjectMapper) {
            this.httpResponseBuilder = httpResponseBuilder;
            this.endpointMethodBuilder = endpointMethodBuilder;
            this.clientGeneratorContext = clientGeneratorContext;
            this.generatedObjectMapper = generatedObjectMapper;
        }

        @Override
        public Void visitJson(JsonResponse json) {
            addTryWithResourcesVariant(httpResponseBuilder);
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
            boolean pagination = httpEndpoint.getPagination().isPresent()
                    && clientGeneratorContext
                            .getGeneratorConfig()
                            .getGeneratePaginatedClients()
                            .orElse(false);
            TypeName responseType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, body.getResponseBodyType());
            boolean isProperty = body.getResponseProperty().isPresent();
            if (isProperty || pagination) {
                httpResponseBuilder.add("$T $L = ", responseType, getParsedResponseVariableName());
            } else {
                httpResponseBuilder.add("return ");
                endpointMethodBuilder.returns(responseType);
            }
            if (body.getResponseBodyType().isContainer() || isAliasContainer(body.getResponseBodyType())) {
                httpResponseBuilder.addStatement(
                        "$T.$L.readValue($L.string(), new $T() {})",
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        getResponseBodyName(),
                        ParameterizedTypeName.get(ClassName.get(TypeReference.class), responseType));
            } else {
                httpResponseBuilder.addStatement(
                        "$T.$L.readValue($L.string(), $T.class)",
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        getResponseBodyName(),
                        responseType);
            }
            if (isProperty) {
                SnippetAndResultType snippet = getNestedPropertySnippet(
                        Optional.empty(), body.getResponseProperty().get(), body.getResponseBodyType());
                httpResponseBuilder.addStatement(CodeBlock.builder()
                        .add("return $L", getParsedResponseVariableName())
                        .add(snippet.codeBlock)
                        .build());
                endpointMethodBuilder.returns(snippet.typeName);
            } else if (pagination) {
                ParameterSpec requestParameterSpec = requestParameterSpec()
                        .orElseThrow(() -> new RuntimeException("Unexpected no parameter spec for paginated endpoint"));
                ClassName pagerClassName =
                        clientGeneratorContext.getPoetClassNameFactory().getPaginationClassName("SyncPagingIterable");
                String endpointName =
                        httpEndpoint.getName().get().getCamelCase().getSafeName();
                String methodParameters = endpointMethodBuilder.parameters.stream()
                        .map(parameterSpec -> parameterSpec.name.equals(requestParameterSpec.name)
                                ? getNextRequestVariableName()
                                : parameterSpec.name)
                        .collect(Collectors.joining(", "));
                httpEndpoint.getPagination().get().visit(new Visitor<Void>() {
                    @Override
                    public Void visitCursor(CursorPagination cursor) {
                        if (cursor.getPage().getPropertyPath().isPresent()
                                && !cursor.getPage().getPropertyPath().get().isEmpty()) {
                            return null;
                        }
                        SnippetAndResultType nextSnippet = getNestedPropertySnippet(
                                cursor.getNext().getPropertyPath(),
                                cursor.getNext().getProperty(),
                                body.getResponseBodyType());
                        CodeBlock nextBlock = CodeBlock.builder()
                                .add(
                                        "$T $L = $L",
                                        nextSnippet.typeName,
                                        getStartingAfterVariableName(),
                                        getParsedResponseVariableName())
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
                                        throw new IllegalArgumentException("Unkown request property value type.");
                                    }
                                });
                        httpResponseBuilder.addStatement(
                                "$T $L = $T.builder().from($L).$L($L).build()",
                                requestParameterSpec.type,
                                getNextRequestVariableName(),
                                requestParameterSpec.type,
                                requestParameterSpec.name,
                                builderStartingAfterProperty,
                                getStartingAfterVariableName());
                        SnippetAndResultType resultSnippet = getNestedPropertySnippet(
                                cursor.getResults().getPropertyPath(),
                                cursor.getResults().getProperty(),
                                body.getResponseBodyType());
                        CodeBlock resultBlock = CodeBlock.builder()
                                .add(
                                        "$T $L = $L",
                                        resultSnippet.typeName,
                                        getResultVariableName(),
                                        getParsedResponseVariableName())
                                .add(resultSnippet.codeBlock)
                                .build();
                        httpResponseBuilder.addStatement(resultBlock);
                        httpResponseBuilder.addStatement(
                                "return new $T<>($L.isPresent(), $L, () -> $L($L))",
                                pagerClassName,
                                getStartingAfterVariableName(),
                                getResultVariableName(),
                                endpointName,
                                methodParameters);
                        com.fern.ir.model.types.ContainerType resultContainerType = resultSnippet
                                .typeReference
                                .getContainer()
                                .orElseThrow(
                                        () -> new RuntimeException("Unexpected non-container pagination result type"));
                        com.fern.ir.model.types.TypeReference resultUnderlyingType =
                                resultContainerType.visit(new ContainerTypeToUnderlyingType());
                        endpointMethodBuilder.returns(ParameterizedTypeName.get(
                                pagerClassName,
                                clientGeneratorContext
                                        .getPoetTypeNameMapper()
                                        .convertToTypeName(true, resultUnderlyingType)));
                        return null;
                    }

                    @Override
                    public Void visitOffset(OffsetPagination offset) {
                        if (offset.getPage().getPropertyPath().isPresent()
                                && !offset.getPage().getPropertyPath().get().isEmpty()) {
                            return null;
                        }
                        com.fern.ir.model.types.TypeReference pageType = offset.getPage()
                                .getProperty()
                                .visit(new RequestPropertyValue.Visitor<com.fern.ir.model.types.TypeReference>() {
                                    @Override
                                    public com.fern.ir.model.types.TypeReference visitQuery(
                                            QueryParameter queryParameter) {
                                        return queryParameter.getValueType();
                                    }

                                    @Override
                                    public com.fern.ir.model.types.TypeReference visitBody(
                                            ObjectProperty objectProperty) {
                                        return objectProperty.getValueType();
                                    }

                                    @Override
                                    public com.fern.ir.model.types.TypeReference _visitUnknown(Object o) {
                                        throw new IllegalArgumentException("Unknown request property value type.");
                                    }
                                });
                        Boolean pageIsOptional = pageType.visit(new TypeReferenceIsOptional(true));
                        if (pageIsOptional) {
                            com.fern.ir.model.types.TypeReference numberType =
                                    pageType.getContainer().get().visit(new ContainerTypeToUnderlyingType());
                            httpResponseBuilder.addStatement(CodeBlock.of(
                                    "$T $L = $L.get$L().map(page -> page + 1).orElse(1)",
                                    clientGeneratorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, numberType),
                                    getNewPageNumberVariableName(),
                                    requestParameterSpec.name,
                                    offset.getPage().getProperty().visit(new RequestPropertyValue.Visitor<String>() {

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
                                    })));
                        } else {
                            httpResponseBuilder.addStatement(CodeBlock.of(
                                    "$T $L = $L.get$L() + 1",
                                    clientGeneratorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, pageType),
                                    getNewPageNumberVariableName(),
                                    requestParameterSpec.name,
                                    offset.getPage().getProperty().visit(new RequestPropertyValue.Visitor<String>() {

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
                                    })));
                        }
                        httpResponseBuilder.addStatement(
                                "$T $L = $T.builder().from($L).$L($L).build()",
                                requestParameterSpec.type,
                                getNextRequestVariableName(),
                                requestParameterSpec.type,
                                requestParameterSpec.name,
                                offset.getPage().getProperty().visit(new RequestPropertyValue.Visitor<String>() {

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
                                }),
                                getNewPageNumberVariableName());

                        SnippetAndResultType resultSnippet = getNestedPropertySnippet(
                                offset.getResults().getPropertyPath(),
                                offset.getResults().getProperty(),
                                body.getResponseBodyType());
                        CodeBlock resultBlock = CodeBlock.builder()
                                .add(
                                        "$T $L = $L",
                                        resultSnippet.typeName,
                                        getResultVariableName(),
                                        getParsedResponseVariableName())
                                .add(resultSnippet.codeBlock)
                                .build();
                        httpResponseBuilder.addStatement(resultBlock);
                        httpResponseBuilder.addStatement(
                                "return new $T<>(true, $L, () -> $L($L))",
                                pagerClassName,
                                getResultVariableName(),
                                endpointName,
                                methodParameters);
                        com.fern.ir.model.types.ContainerType resultContainerType = resultSnippet
                                .typeReference
                                .getContainer()
                                .orElseThrow(
                                        () -> new RuntimeException("Unexpected non-container pagination result type"));
                        com.fern.ir.model.types.TypeReference resultUnderlyingType =
                                resultContainerType.visit(new ContainerTypeToUnderlyingType());
                        endpointMethodBuilder.returns(ParameterizedTypeName.get(
                                pagerClassName,
                                clientGeneratorContext
                                        .getPoetTypeNameMapper()
                                        .convertToTypeName(true, resultUnderlyingType)));
                        return null;
                    }

                    @Override
                    public Void _visitUnknown(Object unknownType) {
                        throw new RuntimeException("Unknown pagination type " + unknownType);
                    }
                });
            }
            return null;
        }

        @Override
        public Void visitFileDownload(FileDownloadResponse fileDownload) {
            addNonTryWithResourcesVariant(httpResponseBuilder);
            endpointMethodBuilder.returns(InputStream.class);
            httpResponseBuilder.addStatement(
                    "return new $T($L)",
                    clientGeneratorContext.getPoetClassNameFactory().getResponseBodyInputStreamClassName(),
                    getResponseName());
            return null;
        }

        @Override
        public Void visitText(TextResponse text) {
            addTryWithResourcesVariant(httpResponseBuilder);
            endpointMethodBuilder.returns(String.class);
            httpResponseBuilder.addStatement("return $L.string()", getResponseBodyName());
            return null;
        }

        @Override
        public Void visitStreaming(StreamingResponse streaming) {
            addNonTryWithResourcesVariant(httpResponseBuilder);
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

            String terminator =
                    streaming.visit(new GetStreamingResponseTerminator()).orElse("\n");
            TypeName bodyTypeName =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, bodyType);
            endpointMethodBuilder.returns(ParameterizedTypeName.get(ClassName.get(Iterable.class), bodyTypeName));

            httpResponseBuilder.addStatement(
                    "return new $T<$T>($T.class, new $T($L), $S)",
                    clientGeneratorContext.getPoetClassNameFactory().getStreamClassName(),
                    bodyTypeName,
                    bodyTypeName,
                    clientGeneratorContext.getPoetClassNameFactory().getResponseBodyReaderClassName(),
                    getResponseName(),
                    terminator);

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

        private boolean isAliasContainer(com.fern.ir.model.types.TypeReference responseBodyType) {
            if (responseBodyType.getNamed().isPresent()) {
                TypeId typeId = responseBodyType.getNamed().get().getTypeId();
                TypeDeclaration typeDeclaration =
                        clientGeneratorContext.getIr().getTypes().get(typeId);
                return typeDeclaration.getShape().getAlias().isPresent()
                        && typeDeclaration
                                .getShape()
                                .getAlias()
                                .get()
                                .getResolvedType()
                                .isContainer();
            }
            return false;
        }
    }

    private SnippetAndResultType getNestedPropertySnippet(
            Optional<List<Name>> propertyPath,
            ObjectProperty objectProperty,
            com.fern.ir.model.types.TypeReference typeReference) {
        ArrayList<Name> fullPropertyPath = propertyPath.map(ArrayList::new).orElse(new ArrayList<>());
        fullPropertyPath.add(objectProperty.getName().getName());
        GetSnippetOutput getSnippetOutput = typeReference.visit(new NestedPropertySnippetGenerator(
                typeReference, fullPropertyPath, false, false, Optional.empty(), Optional.empty()));
        Builder codeBlockBuilder = CodeBlock.builder();
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

        private NestedPropertySnippetGenerator(
                com.fern.ir.model.types.TypeReference typeReference,
                List<Name> propertyPath,
                Boolean previousWasOptional,
                Boolean currentOptional,
                Optional<Name> previousProperty,
                Optional<com.fern.ir.model.types.TypeReference> previousTypeReference) {
            this.typeReference = typeReference;
            this.propertyPath = propertyPath;
            this.previousWasOptional = previousWasOptional;
            this.currentOptional = currentOptional;
            this.previousProperty = previousProperty;
            this.previousTypeReference = previousTypeReference;
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
                    String emptyCollectionString;
                    if (container.isList()) {
                        emptyCollectionString = "List";
                    } else if (container.isSet()) {
                        emptyCollectionString = "Set";
                    } else if (container.isMap()) {
                        emptyCollectionString = "Map";
                    } else {
                        throw new RuntimeException("Unexpected container type");
                    }
                    codeBlocks.add(CodeBlock.builder()
                            .add(".orElse($T.empty$L())", Collections.class, emptyCollectionString)
                            .build());
                }
                return new GetSnippetOutput(typeReference, codeBlocks);
            }
            com.fern.ir.model.types.TypeReference ref = container
                    .getOptional()
                    .orElseThrow(
                            () -> new RuntimeException("Unexpected non-optional container type in snippet generation"));
            return ref.visit(new NestedPropertySnippetGenerator(
                    ref,
                    propertyPath,
                    previousWasOptional || currentOptional,
                    true,
                    previousProperty,
                    previousTypeReference));
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
                                    Optional.of(typeReference)));
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
                                    Optional.of(typeReference)));
                    codeBlocks.addAll(output.code);
                    return new GetSnippetOutput(output.typeReference, codeBlocks);
                }

                @Override
                public GetSnippetOutput visitUnion(UnionTypeDeclaration union) {
                    throw new RuntimeException("Cannot create a snippet with a union");
                }

                @Override
                public GetSnippetOutput visitUndiscriminatedUnion(
                        UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
                    throw new RuntimeException("Cannot create a snippet with an undiscriminated union");
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

    private class SdkRequestIsOptional implements SdkRequestShape.Visitor<Boolean> {

        @Override
        public Boolean visitJustRequestBody(SdkRequestBodyType justRequestBody) {
            return justRequestBody.visit(new SdkRequestBodyType.Visitor<Boolean>() {
                @Override
                public Boolean visitTypeReference(HttpRequestBodyReference typeReference) {
                    return typeReference.getRequestBodyType().visit(new TypeReferenceIsOptional(true));
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
                isOptional = httpEndpoint.getHeaders().stream()
                        .allMatch(httpHeader -> httpHeader.getValueType().visit(new TypeReferenceIsOptional(false)));
            }
            if (!httpEndpoint.getQueryParameters().isEmpty() && isOptional) {
                isOptional = httpEndpoint.getQueryParameters().stream()
                        .allMatch(queryParameter ->
                                queryParameter.getValueType().visit(new TypeReferenceIsOptional(false)));
            }
            if (!httpEndpoint.getPathParameters().isEmpty() && inlinePathParams && isOptional) {
                isOptional = httpEndpoint.getPathParameters().stream()
                        .allMatch(pathParameter ->
                                pathParameter.getValueType().visit(new TypeReferenceIsOptional(false)));
            }
            return isOptional;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    private class TypeReferenceIsOptional implements com.fern.ir.model.types.TypeReference.Visitor<Boolean> {

        private final boolean visitNamedType;

        TypeReferenceIsOptional(boolean visitNamedType) {
            this.visitNamedType = visitNamedType;
        }

        @Override
        public Boolean visitContainer(com.fern.ir.model.types.ContainerType container) {
            return container.isOptional();
        }

        @Override
        public Boolean visitNamed(NamedType named) {
            if (visitNamedType) {
                TypeDeclaration typeDeclaration =
                        clientGeneratorContext.getTypeDeclarations().get(named.getTypeId());
                return typeDeclaration.getShape().visit(new TypeDeclarationIsOptional());
            }
            return false;
        }

        @Override
        public Boolean visitPrimitive(PrimitiveType primitive) {
            return false;
        }

        @Override
        public Boolean visitUnknown() {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    private class TypeDeclarationIsOptional implements Type.Visitor<Boolean> {

        @Override
        public Boolean visitAlias(AliasTypeDeclaration alias) {
            return alias.getAliasOf().visit(new TypeReferenceIsOptional(true));
        }

        @Override
        public Boolean visitEnum(EnumTypeDeclaration _enum) {
            return false;
        }

        @Override
        public Boolean visitObject(ObjectTypeDeclaration object) {
            boolean allPropertiesOptional = object.getProperties().stream()
                    .allMatch(
                            objectProperty -> objectProperty.getValueType().visit(new TypeReferenceIsOptional(false)));
            boolean allExtendsAreOptional = object.getExtends().stream().allMatch(declaredTypeName -> {
                TypeDeclaration typeDeclaration =
                        clientGeneratorContext.getTypeDeclarations().get(declaredTypeName.getTypeId());
                return typeDeclaration.getShape().visit(new TypeDeclarationIsOptional());
            });
            return allPropertiesOptional && allExtendsAreOptional;
        }

        @Override
        public Boolean visitUnion(UnionTypeDeclaration union) {
            return false;
        }

        @Override
        public Boolean visitUndiscriminatedUnion(UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
            return false;
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
                    .allMatch(
                            objectProperty -> objectProperty.getValueType().visit(new TypeReferenceIsOptional(false)));
            boolean allExtendsAreOptional = inlinedRequestBody.getExtends().stream()
                    .allMatch(declaredTypeName -> {
                        TypeDeclaration typeDeclaration =
                                clientGeneratorContext.getTypeDeclarations().get(declaredTypeName.getTypeId());
                        return typeDeclaration.getShape().visit(new TypeDeclarationIsOptional());
                    });
            return allPropertiesOptional && allExtendsAreOptional;
        }

        @Override
        public Boolean visitReference(HttpRequestBodyReference reference) {
            return reference.getRequestBodyType().visit(new TypeReferenceIsOptional(false));
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
            return bodyProperty.getValueType().visit(new TypeReferenceIsOptional(false));
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
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
