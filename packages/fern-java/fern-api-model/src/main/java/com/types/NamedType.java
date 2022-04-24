package com.types;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableNamedType.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface NamedType {
  FernFilepath fernFilepath();

  String name();

  static ImmutableNamedType.FernFilepathBuildStage builder() {
    return ImmutableNamedType.builder();
  }
}
