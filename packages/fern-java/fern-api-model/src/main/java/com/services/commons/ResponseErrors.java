package com.services.commons;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.lang.String;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableResponseErrors.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface ResponseErrors extends IWithDocs {
  String discriminant();

  List<ResponseError> possibleErrors();

  static ImmutableResponseErrors.DiscriminantBuildStage builder() {
    return ImmutableResponseErrors.builder();
  }
}
