package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.Optional;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableWithDocs.class)
public interface WithDocs {

    Optional<String> docs();

    static ImmutableWithDocs.Builder builder() {
        return ImmutableWithDocs.builder();
    }
}
