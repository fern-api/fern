package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableObjectField.class
)
@JsonIgnoreProperties({"_type"})
public interface ObjectField extends IWithDocs {
  String key();

  TypeReference valueType();

  static ImmutableObjectField.KeyBuildStage builder() {
    return ImmutableObjectField.builder();
  }
}
