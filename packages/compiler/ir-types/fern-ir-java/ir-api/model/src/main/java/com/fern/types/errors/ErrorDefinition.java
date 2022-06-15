package com.fern.types.errors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.types.NamedType;
import com.fern.types.types.Type;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableErrorDefinition.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface ErrorDefinition extends IWithDocs {
  NamedType name();

  Type type();

  Optional<HttpErrorConfiguration> http();

  static ImmutableErrorDefinition.NameBuildStage builder() {
    return ImmutableErrorDefinition.builder();
  }
}
