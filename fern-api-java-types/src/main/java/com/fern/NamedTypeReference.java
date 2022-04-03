package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableNamedTypeReference.class)
public interface NamedTypeReference extends WithPackage {

    String name();

    static ImmutableNamedTypeReference.NameBuildStage builder() {
        return ImmutableNamedTypeReference.builder();
    }
}
