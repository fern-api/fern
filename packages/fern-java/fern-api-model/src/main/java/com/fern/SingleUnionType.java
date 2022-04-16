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
    as = ImmutableSingleUnionType.class
)
@JsonIgnoreProperties({"_type"})
public interface SingleUnionType extends IWithDocs {
  String discriminantValue();

  TypeReference valueType();

  static ImmutableSingleUnionType.DiscriminantValueBuildStage builder() {
    return ImmutableSingleUnionType.builder();
  }
}
