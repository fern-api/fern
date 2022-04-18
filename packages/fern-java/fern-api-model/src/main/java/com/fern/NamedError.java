package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableNamedError.class
)
@JsonIgnoreProperties({"_type"})
public interface NamedError {
  String name();

  FernFilepath fernFilepath();

  static ImmutableNamedError.NameBuildStage builder() {
    return ImmutableNamedError.builder();
  }
}
