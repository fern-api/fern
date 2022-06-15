package com.fern.types.services.http;

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
    as = ImmutablePathParameter.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface PathParameter extends IWithDocs {
  String key();

  TypeReference valueType();

  static ImmutablePathParameter.KeyBuildStage builder() {
    return ImmutablePathParameter.builder();
  }
}
