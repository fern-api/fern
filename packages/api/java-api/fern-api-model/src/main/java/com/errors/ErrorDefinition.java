package com.errors;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.types.NamedType;
import java.util.List;
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

  List<ErrorProperty> properties();

  Optional<HttpErrorConfiguration> http();

  static ImmutableErrorDefinition.NameBuildStage builder() {
    return ImmutableErrorDefinition.builder();
  }
}
