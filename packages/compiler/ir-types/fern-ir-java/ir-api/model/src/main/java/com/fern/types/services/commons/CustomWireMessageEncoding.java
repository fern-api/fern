package com.fern.types.services.commons;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableCustomWireMessageEncoding.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface CustomWireMessageEncoding {
  String encoding();

  static ImmutableCustomWireMessageEncoding.EncodingBuildStage builder() {
    return ImmutableCustomWireMessageEncoding.builder();
  }
}
