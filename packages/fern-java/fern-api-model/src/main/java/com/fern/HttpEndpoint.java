package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpEndpoint.class
)
@JsonIgnoreProperties({"_type"})
public interface HttpEndpoint extends IWithDocs {
  String endpointId();

  HttpMethod method();

  String path();

  List<HttpEndpointParameter> parameters();

  List<HttpEndpointQueryParameter> queryParameters();

  List<HttpHeader> headers();

  Optional<HttpRequest> request();

  Optional<HttpResponse> response();

  List<HttpError> errors();

  static ImmutableHttpEndpoint.EndpointIdBuildStage builder() {
    return ImmutableHttpEndpoint.builder();
  }
}
