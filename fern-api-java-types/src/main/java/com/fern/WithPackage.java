package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.Optional;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableWithPackage.class)
public interface WithPackage {

    Optional<String> _package();

    static ImmutableWithPackage.Builder builder() {
        return ImmutableWithPackage.builder();
    }
}
