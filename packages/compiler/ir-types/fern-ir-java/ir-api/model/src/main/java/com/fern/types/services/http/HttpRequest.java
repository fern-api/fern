package com.fern.types.services.http;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.services.commons.Encoding;
import com.fern.types.types.Type;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpRequest.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface HttpRequest extends IWithDocs {
  Encoding encoding();

  Type type();

  static ImmutableHttpRequest.EncodingBuildStage builder() {
    return ImmutableHttpRequest.builder();
  }
}
