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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.environment.EnvironmentBaseUrlId;
import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.FileDownloadResponse;
import com.fern.ir.model.http.FileProperty;
import com.fern.ir.model.http.FileUploadRequest;
import com.fern.ir.model.http.FileUploadRequestProperty;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.HttpResponse;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.http.InlinedRequestBodyProperty;
import com.fern.ir.model.http.JsonResponse;
import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.http.SdkRequest;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.http.SdkRequestShape;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.ir.model.http.StreamingResponse;
import com.fern.ir.model.http.TextResponse;
import com.fern.ir.model.types.AliasTypeDeclaration;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.EnumTypeDeclaration;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.ir.model.types.UnionTypeDeclaration;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.MultiUrlEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.SingleUrlEnvironmentClass;
import com.fern.java.client.generators.endpoint.HttpUrlBuilder.PathParamInfo;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.lang.model.element.Modifier;
import okhttp3.Response;

public abstract class AbstractEndpointWriter {

    public static final String CONTENT_TYPE_HEADER = "Content-Type";
    public static final String APPLICATION_JSON_HEADER = "application/json";
    public static final String APPLICATION_OCTET_STREAM = "application/octet-stream";
    public static final String REQUEST_NAME = "_request";
    public static final String REQUEST_BUILDER_NAME = "_requestBuilder";
    public static final String REQUEST_BODY_NAME = "_requestBody";
    public static final String RESPONSE_NAME = "_response";
    public static final String REQUEST_OPTIONS_PARAMETER_NAME = "requestOptions";
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final GeneratedClientOptions generatedClientOptions;
    private final FieldSpec clientOptionsField;
    private final ClientGeneratorContext clientGeneratorContext;
    private final MethodSpec.Builder endpointMethodBuilder;
    private final GeneratedObjectMapper generatedObjectMapper;
    private final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final GeneratedJavaFile requestOptionsFile;

    public AbstractEndpointWriter(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedJavaFile requestOptionsFile) {
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
        this.requestOptionsFile = requestOptionsFile;
    }

    public final HttpEndpointMethodSpecs generate() {
        // Step 1: Add Path Params as parameters
        List<ParameterSpec> pathParameters = getPathParameters();

        // Step 2: Add additional parameters
        List<ParameterSpec> additionalParameters = additionalParameters();

        // Step 3: Add path parameters
        endpointMethodBuilder.addParameters(pathParameters);
        endpointMethodBuilder.addParameters(additionalParameters);
        endpointMethodBuilder.addParameter(
                ParameterSpec.builder(requestOptionsFile.getClassName(), REQUEST_OPTIONS_PARAMETER_NAME)
                        .build());

        // Step 4: Get http client initializer
        HttpUrlBuilder httpUrlBuilder = new HttpUrlBuilder(
                getHttpUrlName(endpointMethodBuilder.parameters.stream()
                        .map(parameterSpec -> parameterSpec.name)
                        .collect(Collectors.toList())),
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
                convertPathParametersToSpecMap(httpEndpoint.getPathParameters()));
        HttpUrlBuilder.GeneratedHttpUrl generatedHttpUrl = httpUrlBuilder.generateBuilder(getQueryParams());
        endpointMethodBuilder.addCode(generatedHttpUrl.initialization());

        // Step 5: Get request initializer
        boolean sendContentType = httpEndpoint.getRequestBody().isPresent()
                || httpEndpoint.getResponse().isPresent();
        CodeBlock requestInitializer = getInitializeRequestCodeBlock(
                clientOptionsField,
                generatedClientOptions,
                httpEndpoint,
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

        return new HttpEndpointMethodSpecs(
                endpointWithRequestOptions, endpointWithoutRequestOptions, endpointWithoutRequest);
    }

    public abstract Optional<SdkRequest> sdkRequest();

    public abstract List<EnrichedObjectProperty> getQueryParams();

    public abstract List<ParameterSpec> additionalParameters();

    public abstract CodeBlock getInitializeRequestCodeBlock(
            FieldSpec clientOptionsMember,
            GeneratedClientOptions clientOptions,
            HttpEndpoint endpoint,
            GeneratedObjectMapper objectMapper,
            CodeBlock inlineableHttpUrl,
            boolean sendContentType);

    public final CodeBlock getResponseParserCodeBlock() {
        CodeBlock.Builder httpResponseBuilder = CodeBlock.builder()
                .beginControlFlow("try")
                .addStatement(
                        "$T $L = $N.$N().newCall($L).execute()",
                        Response.class,
                        RESPONSE_NAME,
                        clientOptionsField,
                        generatedClientOptions.httpClient(),
                        REQUEST_NAME)
                .beginControlFlow("if ($L.isSuccessful())", RESPONSE_NAME);
        if (httpEndpoint.getResponse().isPresent()) {
            httpEndpoint
                    .getResponse()
                    .get()
                    .visit(new SuccessResponseWriter(
                            httpResponseBuilder, endpointMethodBuilder, clientGeneratorContext, generatedObjectMapper));
        } else {
            httpResponseBuilder.addStatement("return");
        }
        httpResponseBuilder.endControlFlow();
        httpResponseBuilder.addStatement(
                "throw new $T($L.code(), $T.$L.readValue($L.body().string(), $T.class))",
                clientGeneratorContext.getPoetClassNameFactory().getApiErrorClassName(),
                RESPONSE_NAME,
                generatedObjectMapper.getClassName(),
                generatedObjectMapper.jsonMapperStaticField().name,
                RESPONSE_NAME,
                Object.class);
        httpResponseBuilder
                .endControlFlow()
                .beginControlFlow("catch ($T e)", IOException.class)
                .addStatement("throw new $T(e)", RuntimeException.class)
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

    private String getHttpUrlName(List<String> paramNames) {
        if (paramNames.contains("httpUrl")) {
            return "_httpUrl";
        }
        return "httpUrl";
    }

    private List<ParameterSpec> getPathParameters() {
        List<ParameterSpec> pathParameterSpecs = new ArrayList<>();
        httpService.getPathParameters().forEach(pathParameter -> {
            if (pathParameter.getVariable().isPresent()) {
                return;
            }
            pathParameterSpecs.add(convertPathParameter(pathParameter).poetParam());
        });
        httpEndpoint.getPathParameters().forEach(pathParameter -> {
            if (pathParameter.getVariable().isPresent()) {
                return;
            }
            pathParameterSpecs.add(convertPathParameter(pathParameter).poetParam());
        });
        return pathParameterSpecs;
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

    private static final class SuccessResponseWriter implements HttpResponse.Visitor<Void> {

        private final CodeBlock.Builder httpResponseBuilder;
        private final MethodSpec.Builder endpointMethodBuilder;
        private final GeneratedObjectMapper generatedObjectMapper;
        private final ClientGeneratorContext clientGeneratorContext;

        SuccessResponseWriter(
                CodeBlock.Builder httpResponseBuilder,
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
            TypeName returnType =
                    clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, json.getResponseBodyType());
            endpointMethodBuilder.returns(returnType);
            if (json.getResponseBodyType().isContainer() || isAliasContainer(json.getResponseBodyType())) {
                httpResponseBuilder.addStatement(
                        "return $T.$L.readValue($L.body().string(), new $T() {})",
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        RESPONSE_NAME,
                        ParameterizedTypeName.get(ClassName.get(TypeReference.class), returnType));
            } else {
                httpResponseBuilder.addStatement(
                        "return $T.$L.readValue($L.body().string(), $T.class)",
                        generatedObjectMapper.getClassName(),
                        generatedObjectMapper.jsonMapperStaticField().name,
                        RESPONSE_NAME,
                        returnType);
            }
            return null;
        }

        @Override
        public Void visitFileDownload(FileDownloadResponse fileDownload) {
            endpointMethodBuilder.returns(InputStream.class);
            httpResponseBuilder.addStatement("return $L.body().byteStream()", RESPONSE_NAME);
            return null;
        }

        @Override
        public Void visitText(TextResponse text) {
            endpointMethodBuilder.returns(String.class);
            httpResponseBuilder.addStatement("return $L.body().string()", RESPONSE_NAME);
            return null;
        }

        @Override
        public Void visitStreaming(StreamingResponse streaming) {
            throw new RuntimeException("Streaming endpoint responses are not supported in java");
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

    private class SdkRequestIsOptional implements SdkRequestShape.Visitor<Boolean> {

        @Override
        public Boolean visitJustRequestBody(SdkRequestBodyType justRequestBody) {
            return justRequestBody.visit(new SdkRequestBodyType.Visitor<Boolean>() {
                @Override
                public Boolean visitTypeReference(HttpRequestBodyReference typeReference) {
                    return typeReference.getRequestBodyType().visit(new TypeReferenceIsOptional());
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
                        .allMatch(httpHeader -> httpHeader.getValueType().visit(new TypeReferenceIsOptional()));
            }
            if (!httpEndpoint.getQueryParameters().isEmpty() && isOptional) {
                isOptional = httpEndpoint.getQueryParameters().stream()
                        .allMatch(
                                queryParameter -> queryParameter.getValueType().visit(new TypeReferenceIsOptional()));
            }
            return isOptional;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    private class TypeReferenceIsOptional implements com.fern.ir.model.types.TypeReference.Visitor<Boolean> {

        @Override
        public Boolean visitContainer(ContainerType container) {
            return container.isOptional();
        }

        @Override
        public Boolean visitNamed(DeclaredTypeName named) {
            TypeDeclaration typeDeclaration =
                    clientGeneratorContext.getTypeDeclarations().get(named.getTypeId());
            return typeDeclaration.getShape().visit(new TypeDeclarationIsOptional());
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
            return alias.getAliasOf().visit(new TypeReferenceIsOptional());
        }

        @Override
        public Boolean visitEnum(EnumTypeDeclaration _enum) {
            return false;
        }

        @Override
        public Boolean visitObject(ObjectTypeDeclaration object) {
            boolean allPropertiesOptional = object.getProperties().stream()
                    .allMatch(objectProperty -> objectProperty.getValueType().visit(new TypeReferenceIsOptional()));
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

    private class HttpRequestBodyIsOptional implements HttpRequestBody.Visitor<Boolean> {

        @Override
        public Boolean visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
            boolean allPropertiesOptional = inlinedRequestBody.getProperties().stream()
                    .allMatch(objectProperty -> objectProperty.getValueType().visit(new TypeReferenceIsOptional()));
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
            return reference.getRequestBodyType().visit(new TypeReferenceIsOptional());
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
            return file.getIsOptional();
        }

        @Override
        public Boolean visitBodyProperty(InlinedRequestBodyProperty bodyProperty) {
            return bodyProperty.getValueType().visit(new TypeReferenceIsOptional());
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }
}
