package com.services.http;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.types.TypeReference;
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
