package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableErrorReference.class
)
@JsonIgnoreProperties({"_type"})
public interface ErrorReference extends IWithDocs {
  NamedError error();

  static ImmutableErrorReference.ErrorBuildStage builder() {
    return ImmutableErrorReference.builder();
  }
}
