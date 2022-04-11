package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWithFilepath.class)
public interface WithFilepath extends IWithFilepath {

    static ImmutableWithFilepath.Builder builder() {
        return ImmutableWithFilepath.builder();
    }
}
