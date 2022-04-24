package com.services.commons;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.commons.interfaces.IBaseService;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableBaseService.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface BaseService extends IWithDocs, IBaseService {
  static ImmutableBaseService.BasePathBuildStage builder() {
    return ImmutableBaseService.builder();
  }
}
