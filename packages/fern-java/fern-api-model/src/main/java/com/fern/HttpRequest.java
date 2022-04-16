package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpRequest.class
)
@JsonIgnoreProperties({"_type"})
public interface HttpRequest extends IWithDocs {
  TypeReference bodyType();

  static ImmutableHttpRequest.BodyTypeBuildStage builder() {
    return ImmutableHttpRequest.builder();
  }
}
