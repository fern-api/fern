package com.services.commons;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.types.NamedType;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableResponseError.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface ResponseError extends IWithDocs {
  String discriminantValue();

  NamedType error();

  static ImmutableResponseError.DiscriminantValueBuildStage builder() {
    return ImmutableResponseError.builder();
  }
}
