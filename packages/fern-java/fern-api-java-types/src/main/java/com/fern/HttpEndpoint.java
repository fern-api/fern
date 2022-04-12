package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;
import java.util.Optional;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableHttpEndpoint.class)
@JsonIgnoreProperties({"type"})
public interface HttpEndpoint extends IWithDocs {

    String endpointId();

    HttpVerb verb();

    String path();

    List<HttpEndpointParameter> parameters();

    List<HttpEndpointQueryParameter> queryParameters();

    List<HttpHeader> header();

    Optional<HttpRequest> request();

    Optional<HttpResponse> response();

    List<HttpError> errors();

    static ImmutableHttpEndpoint.EndpointIdBuildStage builder() {
        return ImmutableHttpEndpoint.builder();
    }
}
