package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableEnumTypeDefinition.class
)
@JsonIgnoreProperties({"_type"})
public interface EnumTypeDefinition {
  List<EnumValue> values();

  static ImmutableEnumTypeDefinition.Builder builder() {
    return ImmutableEnumTypeDefinition.builder();
  }
}
