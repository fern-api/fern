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
    as = ImmutableEnumValue.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface EnumValue extends IWithDocs {
  String value();

  static ImmutableEnumValue.ValueBuildStage builder() {
    return ImmutableEnumValue.builder();
  }
}
