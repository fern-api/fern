package com.types;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableObjectProperty.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface ObjectProperty extends IWithDocs {
  String key();

  TypeReference valueType();

  static ImmutableObjectProperty.KeyBuildStage builder() {
    return ImmutableObjectProperty.builder();
  }
}
