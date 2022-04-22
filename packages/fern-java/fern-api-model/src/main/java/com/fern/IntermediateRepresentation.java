package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableIntermediateRepresentation.class
)
@JsonIgnoreProperties({"_type"})
public interface IntermediateRepresentation {
  List<TypeDefinition> types();

  List<ErrorDefinition> errors();

  Services services();

  static ImmutableIntermediateRepresentation.ServicesBuildStage builder() {
    return ImmutableIntermediateRepresentation.builder();
  }
}
