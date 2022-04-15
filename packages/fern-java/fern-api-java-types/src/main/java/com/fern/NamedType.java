package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;

import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableNamedType.class)
@JsonIgnoreProperties({"type"})
public interface NamedType {

    String name();

    FernFilepath fernFilepath();

    static ImmutableNamedType.NameBuildStage builder() {
        return ImmutableNamedType.builder();
    }
}
