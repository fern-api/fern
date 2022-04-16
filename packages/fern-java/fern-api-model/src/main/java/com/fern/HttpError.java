package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.Integer;
import java.lang.String;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpError.class
)
@JsonIgnoreProperties({"_type"})
public interface HttpError extends IWithDocs {
  String name();

  Integer statusCode();

  Optional<TypeReference> bodyType();

  static ImmutableHttpError.NameBuildStage builder() {
    return ImmutableHttpError.builder();
  }
}
