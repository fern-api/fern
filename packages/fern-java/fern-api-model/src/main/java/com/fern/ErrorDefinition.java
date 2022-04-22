package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableErrorDefinition.class
)
@JsonIgnoreProperties({"_type"})
public interface ErrorDefinition extends IWithDocs {
  NamedError name();

  Optional<HttpErrorConfiguration> http();

  List<ErrorProperty> properties();

  static ImmutableErrorDefinition.NameBuildStage builder() {
    return ImmutableErrorDefinition.builder();
  }
}
