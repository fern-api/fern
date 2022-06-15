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
    as = ImmutableHttpHeader.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface HttpHeader extends IWithDocs {
  String header();

  TypeReference valueType();

  static ImmutableHttpHeader.HeaderBuildStage builder() {
    return ImmutableHttpHeader.builder();
  }
}
