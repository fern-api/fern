package com.fern.types.services.commons;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableFailedResponse.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface FailedResponse extends IWithDocs {
  String discriminant();

  List<ResponseError> errors();

  static ImmutableFailedResponse.DiscriminantBuildStage builder() {
    return ImmutableFailedResponse.builder();
  }
}
