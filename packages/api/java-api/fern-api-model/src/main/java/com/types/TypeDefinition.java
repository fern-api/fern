package com.types;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
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
