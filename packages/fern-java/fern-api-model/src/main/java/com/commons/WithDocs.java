package com.commons;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWithDocs.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface WithDocs extends IWithDocs {
  static ImmutableWithDocs.Builder builder() {
    return ImmutableWithDocs.builder();
  }
}
