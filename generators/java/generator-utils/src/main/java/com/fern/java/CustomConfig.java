package com.fern.java;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
@JsonDeserialize(as = ImmutableCustomConfig.class)
public interface CustomConfig extends ICustomConfig {

    static ImmutableCustomConfig.Builder builder() {
        return ImmutableCustomConfig.builder();
    }
}
