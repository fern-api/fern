package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;

import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWithFilepath.class)
@JsonIgnoreProperties({"type"})
public interface WithFilepath extends IWithFilepath {

    static ImmutableWithFilepath.FilepathBuildStage builder() {
        return ImmutableWithFilepath.builder();
    }
}