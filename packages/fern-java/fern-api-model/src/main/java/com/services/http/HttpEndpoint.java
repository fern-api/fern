package com.services.http;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.commons.ResponseErrors;
import com.services.commons.WireMessage;
import java.lang.String;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpEndpoint.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface HttpEndpoint extends IWithDocs {
  String endpointId();

  String path();

  HttpMethod method();

  List<HttpHeader> headers();

  List<PathParameter> parameters();

  List<QueryParameter> queryParameters();

  Optional<WireMessage> request();

  Optional<WireMessage> response();

  ResponseErrors errors();

  static ImmutableHttpEndpoint.EndpointIdBuildStage builder() {
    return ImmutableHttpEndpoint.builder();
  }
}
