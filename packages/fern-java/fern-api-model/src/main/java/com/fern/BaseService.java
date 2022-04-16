package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IBaseService;
import com.fern.interfaces.IWithDocs;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableBaseService.class
)
@JsonIgnoreProperties({"_type"})
public interface BaseService extends IWithDocs, IBaseService {
  static ImmutableBaseService.NameBuildStage builder() {
    return ImmutableBaseService.builder();
  }
}
