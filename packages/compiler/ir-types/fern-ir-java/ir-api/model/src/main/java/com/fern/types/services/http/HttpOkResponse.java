package com.fern.types.services.http;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.types.Type;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpOkResponse.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface HttpOkResponse extends IWithDocs {
  Type type();

  static ImmutableHttpOkResponse.TypeBuildStage builder() {
    return ImmutableHttpOkResponse.builder();
  }
}
