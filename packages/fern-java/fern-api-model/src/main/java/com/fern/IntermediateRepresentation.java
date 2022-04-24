package com.fern;

import com.StagedBuilderStyle;
import com.errors.ErrorDefinition;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.types.TypeDefinition;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableIntermediateRepresentation.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface IntermediateRepresentation {
  List<TypeDefinition> types();

  Services services();

  List<ErrorDefinition> errors();

  static ImmutableIntermediateRepresentation.ServicesBuildStage builder() {
    return ImmutableIntermediateRepresentation.builder();
  }
}
