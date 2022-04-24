package com.errors;

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
    as = ImmutableErrorProperty.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface ErrorProperty extends IWithDocs {
  String name();

  TypeReference type();

  static ImmutableErrorProperty.NameBuildStage builder() {
    return ImmutableErrorProperty.builder();
  }
}
