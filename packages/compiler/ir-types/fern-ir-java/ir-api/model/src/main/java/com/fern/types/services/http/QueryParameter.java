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
    as = ImmutableQueryParameter.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface QueryParameter extends IWithDocs {
  String key();

  TypeReference valueType();

  static ImmutableQueryParameter.KeyBuildStage builder() {
    return ImmutableQueryParameter.builder();
  }
}
