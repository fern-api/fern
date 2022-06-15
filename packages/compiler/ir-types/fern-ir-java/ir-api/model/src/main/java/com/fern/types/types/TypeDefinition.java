package com.fern.types.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableTypeDefinition.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface TypeDefinition extends IWithDocs {
  NamedType name();

  Type shape();

  static ImmutableTypeDefinition.NameBuildStage builder() {
    return ImmutableTypeDefinition.builder();
  }
}
