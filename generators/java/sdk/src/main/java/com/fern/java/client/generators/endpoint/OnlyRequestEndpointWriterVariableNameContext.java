package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequest;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class OnlyRequestEndpointWriterVariableNameContext extends AbstractEndpointWriterVariableNameContext {
    private final ClientGeneratorContext clientGeneratorContext;
    private final SdkRequestBodyType sdkRequestBodyType;
    private final SdkRequest sdkRequest;
    private final GeneratedWrappedRequest generatedWrappedRequest;

    public OnlyRequestEndpointWriterVariableNameContext(
            ClientGeneratorContext clientGeneratorContext,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            SdkRequestBodyType sdkRequestBodyType,
            SdkRequest sdkRequest) {
        super(clientGeneratorContext, httpService, httpEndpoint);
        this.clientGeneratorContext = clientGeneratorContext;
        this.sdkRequestBodyType = sdkRequestBodyType;
        this.sdkRequest = sdkRequest;
        this.generatedWrappedRequest = null;
        initializeCollections();
    }

    public OnlyRequestEndpointWriterVariableNameContext(
            ClientGeneratorContext clientGeneratorContext,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratedWrappedRequest generatedWrappedRequest,
            SdkRequest sdkRequest) {
        super(clientGeneratorContext, httpService, httpEndpoint);
        this.clientGeneratorContext = clientGeneratorContext;
        this.sdkRequestBodyType = null;
        this.generatedWrappedRequest = generatedWrappedRequest;
        this.sdkRequest = sdkRequest;
        initializeCollections();
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
                    return getBytesRequestParameterSpec(bytes, sdkRequest, TypeName.get(InputStream.class));
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
    public Optional<TypeName> getBodyTypeName() {
        return Optional.empty();
    }

    @Override
    public String getBodyParameterName() {
        return "body";
    }

    @Override
    public String getBodyPropertyName() {
        return "body";
    }
}
