package com.types;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableFernFilepath.class
)
public interface FernFilepath {
  @JsonValue
  String value();

  static FernFilepath valueOf(String value) {
    return ImmutableFernFilepath.builder().value(value).build();
  }
}
