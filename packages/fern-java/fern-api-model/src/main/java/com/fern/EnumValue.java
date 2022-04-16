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
    as = ImmutableEnumValue.class
)
@JsonIgnoreProperties({"_type"})
public interface EnumValue extends IWithDocs {
  String value();

  static ImmutableEnumValue.ValueBuildStage builder() {
    return ImmutableEnumValue.builder();
  }
}
