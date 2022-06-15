package com.fern.types.services.http;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpEndpoint.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface HttpEndpoint extends IWithDocs {
  String endpointId();

  String path();

  HttpMethod method();

  List<HttpHeader> headers();

  List<PathParameter> pathParameters();

  List<QueryParameter> queryParameters();

  HttpRequest request();

  HttpResponse response();

  HttpAuth auth();

  static ImmutableHttpEndpoint.EndpointIdBuildStage builder() {
    return ImmutableHttpEndpoint.builder();
  }
}
