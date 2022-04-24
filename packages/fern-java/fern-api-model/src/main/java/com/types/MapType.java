package com.types;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableMapType.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface MapType {
  TypeReference keyType();

  TypeReference valueType();

  static ImmutableMapType.KeyTypeBuildStage builder() {
    return ImmutableMapType.builder();
  }
}
