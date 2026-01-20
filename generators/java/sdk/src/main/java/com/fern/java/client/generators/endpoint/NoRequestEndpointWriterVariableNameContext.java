package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.SdkRequest;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class NoRequestEndpointWriterVariableNameContext extends AbstractEndpointWriterVariableNameContext {
    public NoRequestEndpointWriterVariableNameContext(
            ClientGeneratorContext clientGeneratorContext, HttpService httpService, HttpEndpoint httpEndpoint) {
        super(clientGeneratorContext, httpService, httpEndpoint);
        initializeCollections();
    }

    @Override
    public Optional<SdkRequest> sdkRequest() {
        return Optional.empty();
    }

    @Override
    public List<EnrichedObjectProperty> getQueryParams() {
        return Collections.emptyList();
    }

    @Override
    public List<ParameterSpec> additionalParameters() {
        return Collections.emptyList();
    }

    @Override
    public Optional<ParameterSpec> requestParameterSpec() {
        return Optional.empty();
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

    @Override
    public Optional<TypeName> getWrapperTypeName() {
        return Optional.empty();
    }
}
