package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableTypeName.class
)
@JsonIgnoreProperties({"_type"})
public interface TypeName {
  String name();

  FernFilepath fernFilepath();

  static ImmutableTypeName.NameBuildStage builder() {
    return ImmutableTypeName.builder();
  }
}
