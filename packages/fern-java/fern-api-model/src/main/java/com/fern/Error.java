package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.Integer;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableError.class
)
@JsonIgnoreProperties({"_type"})
public interface Error extends IWithDocs {
  NamedError name();

  Optional<Integer> httpStatusCode();

  Optional<TypeReference> bodyType();

  static ImmutableError.NameBuildStage builder() {
    return ImmutableError.builder();
  }
}
