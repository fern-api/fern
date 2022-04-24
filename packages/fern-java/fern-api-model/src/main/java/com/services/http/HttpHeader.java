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
    as = ImmutableHttpHeader.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface HttpHeader extends IWithDocs {
  String header();

  TypeReference valueType();

  static ImmutableHttpHeader.HeaderBuildStage builder() {
    return ImmutableHttpHeader.builder();
  }
}
