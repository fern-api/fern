package com.fern.types.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableEnumValue.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface EnumValue extends IWithDocs {
  String name();

  String value();

  static ImmutableEnumValue.NameBuildStage builder() {
    return ImmutableEnumValue.builder();
  }
}
