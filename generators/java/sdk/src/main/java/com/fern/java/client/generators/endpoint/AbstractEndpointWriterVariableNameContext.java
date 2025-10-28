package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.http.PathParameterLocation;
import com.fern.ir.model.http.SdkRequest;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public abstract class AbstractEndpointWriterVariableNameContext {

    public static final String REQUEST_OPTIONS_PARAMETER_NAME = "requestOptions";

    public final Set<String> endpointParameterNames = new HashSet<>();
    public List<HttpUrlBuilder.PathParamInfo> pathParamInfos = new ArrayList<>();
    public final List<ParameterSpec> pathParameters = new ArrayList<>();
    protected final ClientGeneratorContext clientGeneratorContext;
    protected final HttpEndpoint httpEndpoint;
    protected final HttpService httpService;
    protected final boolean inlinePathParams;

    public AbstractEndpointWriterVariableNameContext(
            ClientGeneratorContext clientGeneratorContext, HttpService httpService, HttpEndpoint httpEndpoint) {
        this.clientGeneratorContext = clientGeneratorContext;
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
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

    public abstract Optional<SdkRequest> sdkRequest();

    public abstract List<EnrichedObjectProperty> getQueryParams();

    public abstract List<ParameterSpec> additionalParameters();

    public abstract Optional<ParameterSpec> requestParameterSpec();

    protected void initializeCollections() {
        httpService.getPathParameters().forEach(pathParameter -> {
            if (pathParameter.getVariable().isPresent()) {
                return;
            }
            this.pathParamInfos.add(convertPathParameter(pathParameter));
        });
        httpEndpoint.getPathParameters().forEach(pathParameter -> {
            if (pathParameter.getVariable().isPresent()) {
                return;
            }
            this.pathParamInfos.add(convertPathParameter(pathParameter));
        });
        if (inlinePathParams) {
            this.pathParamInfos = this.pathParamInfos.stream()
                    .filter(param -> !param.irParam().getLocation().equals(PathParameterLocation.ENDPOINT))
                    .collect(Collectors.toList());
        }
        this.pathParameters.addAll(this.pathParamInfos.stream()
                .map(HttpUrlBuilder.PathParamInfo::poetParam)
                .collect(Collectors.toList()));
        this.endpointParameterNames.addAll(
                pathParameters.stream().map(parameterSpec -> parameterSpec.name).collect(Collectors.toList()));
        this.endpointParameterNames.addAll(additionalParameters().stream()
                .map(parameterSpec -> parameterSpec.name)
                .collect(Collectors.toList()));
        this.endpointParameterNames.add(REQUEST_OPTIONS_PARAMETER_NAME);
    }

    public final String getVariableName(String variable) {
        if (this.endpointParameterNames.contains(variable)) {
            return "_" + variable;
        }
        return variable;
    }

    public String getDefaultedClientName() {
        return "client";
    }

    public String getHttpUrlName() {
        if (this.endpointParameterNames.contains("httpUrl")) {
            return "_httpUrl";
        }
        return "httpUrl";
    }

    public String getResponseName() {
        if (this.endpointParameterNames.contains("response")) {
            return "_response";
        }
        return "response";
    }

    public String getResponseBodyName() {
        return getVariableName("responseBody");
    }

    public String getParsedResponseVariableName() {
        return getVariableName("parsedResponse");
    }

    public String getResponseBodyStringName() {
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

    public final ParameterSpec getBytesRequestParameterSpec(
            BytesRequest bytes, SdkRequest sdkRequest, TypeName typeName) {
        if (bytes.getIsOptional()) {
            typeName = ParameterizedTypeName.get(ClassName.get(Optional.class), typeName);
        }
        return ParameterSpec.builder(
                        typeName,
                        sdkRequest.getRequestParameterName().getCamelCase().getSafeName())
                .build();
    }

    private HttpUrlBuilder.PathParamInfo convertPathParameter(PathParameter pathParameter) {
        TypeName typeName =
                clientGeneratorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParameter.getValueType());
        ParameterSpec.Builder paramBuilder = ParameterSpec.builder(
                typeName, pathParameter.getName().getCamelCase().getSafeName());

        if (clientGeneratorContext.getCustomConfig().useNullableAnnotation()
                && com.fern.java.utils.NullableAnnotationUtils.isNullableType(pathParameter.getValueType())
                && !typeName.isPrimitive()) {
            paramBuilder.addAnnotation(com.fern.java.utils.NullableAnnotationUtils.getNullableAnnotation());
        }

        return HttpUrlBuilder.PathParamInfo.builder()
                .irParam(pathParameter)
                .poetParam(paramBuilder.build())
                .build();
    }
}
