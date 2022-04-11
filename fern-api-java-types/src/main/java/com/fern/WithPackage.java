package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWithPackage.class)
public interface WithPackage extends IWithPackage {

    static ImmutableWithPackage.Builder builder() {
        return ImmutableWithPackage.builder();
    }
}
