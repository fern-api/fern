package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableUnionTypeDefinition.class
)
@JsonIgnoreProperties({"_type"})
public interface UnionTypeDefinition {
  List<SingleUnionType> types();

  static ImmutableUnionTypeDefinition.Builder builder() {
    return ImmutableUnionTypeDefinition.builder();
  }
}
