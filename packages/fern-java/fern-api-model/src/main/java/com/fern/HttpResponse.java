package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpResponse.class
)
@JsonIgnoreProperties({"_type"})
public interface HttpResponse extends IWithDocs {
  TypeReference bodyType();

  static ImmutableHttpResponse.BodyTypeBuildStage builder() {
    return ImmutableHttpResponse.builder();
  }
}
