package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.lang.Integer;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpErrorConfiguration.class
)
@JsonIgnoreProperties({"_type"})
public interface HttpErrorConfiguration {
  Integer statusCode();

  static ImmutableHttpErrorConfiguration.StatusCodeBuildStage builder() {
    return ImmutableHttpErrorConfiguration.builder();
  }
}
