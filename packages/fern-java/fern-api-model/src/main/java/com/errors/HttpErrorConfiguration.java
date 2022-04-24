package com.errors;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpErrorConfiguration.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface HttpErrorConfiguration {
  int statusCode();

  static ImmutableHttpErrorConfiguration.StatusCodeBuildStage builder() {
    return ImmutableHttpErrorConfiguration.builder();
  }
}
