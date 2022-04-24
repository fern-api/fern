package com.types;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableAliasTypeDefinition.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface AliasTypeDefinition {
  TypeReference aliasOf();

  static ImmutableAliasTypeDefinition.AliasOfBuildStage builder() {
    return ImmutableAliasTypeDefinition.builder();
  }
}
