package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;

import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableNamedTypeReference.class)
public interface NamedTypeReference extends IWithFilepath {

    String name();

    static ImmutableNamedTypeReference.FilepathBuildStage builder() {
        return ImmutableNamedTypeReference.builder();
    }
}
