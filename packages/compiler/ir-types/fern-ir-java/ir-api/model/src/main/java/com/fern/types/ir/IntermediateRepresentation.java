package com.fern.types.ir;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.types.errors.ErrorDefinition;
import com.fern.types.types.TypeDefinition;
import java.lang.String;
import java.util.List;
import java.util.Optional;
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
  Optional<String> workspaceName();

  List<TypeDefinition> types();

  Services services();

  List<ErrorDefinition> errors();

  static ImmutableIntermediateRepresentation.ServicesBuildStage builder() {
    return ImmutableIntermediateRepresentation.builder();
  }
}
