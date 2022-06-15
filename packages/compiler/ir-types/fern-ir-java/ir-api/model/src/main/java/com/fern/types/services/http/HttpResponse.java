package com.fern.types.services.http;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.services.commons.Encoding;
import com.fern.types.services.commons.FailedResponse;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpResponse.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface HttpResponse extends IWithDocs {
  Encoding encoding();

  HttpOkResponse ok();

  FailedResponse failed();

  static ImmutableHttpResponse.EncodingBuildStage builder() {
    return ImmutableHttpResponse.builder();
  }
}
