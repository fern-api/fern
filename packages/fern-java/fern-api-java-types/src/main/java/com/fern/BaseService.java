package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableBaseService.class)
@JsonIgnoreProperties({"type"})
public interface BaseService extends IBaseService {

    static ImmutableBaseService.NameBuildStage builder() {
        return ImmutableBaseService.builder();
    }
}
