package com.fern.types.services.http;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.types.NamedType;
import java.lang.String;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpService.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface HttpService extends IWithDocs {
  NamedType name();

  Optional<String> basePath();

  List<HttpEndpoint> endpoints();

  List<HttpHeader> headers();

  static ImmutableHttpService.NameBuildStage builder() {
    return ImmutableHttpService.builder();
  }
}
