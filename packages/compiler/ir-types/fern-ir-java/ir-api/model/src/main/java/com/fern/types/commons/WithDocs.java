package com.fern.types.commons;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWithDocs.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WithDocs extends IWithDocs {
  static ImmutableWithDocs.Builder builder() {
    return ImmutableWithDocs.builder();
  }
}
