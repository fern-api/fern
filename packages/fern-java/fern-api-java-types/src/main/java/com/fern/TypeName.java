package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;

import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableTypeName.class)
@JsonIgnoreProperties({"type"})
public interface TypeName {

    String name();

    FernFilepath fernFilepath();

    static ImmutableTypeName.NameBuildStage builder() {
        return ImmutableTypeName.builder();
    }
}
