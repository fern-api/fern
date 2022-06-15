package com.fern.types.services.commons;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.types.TypeReference;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableResponseError.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface ResponseError extends IWithDocs {
  String discriminantValue();

  TypeReference error();

  static ImmutableResponseError.DiscriminantValueBuildStage builder() {
    return ImmutableResponseError.builder();
  }
}
