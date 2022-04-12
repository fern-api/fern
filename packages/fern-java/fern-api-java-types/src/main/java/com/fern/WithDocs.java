package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWithDocs.class)
public interface WithDocs extends IWithDocs {

    static ImmutableWithDocs.Builder builder() {
        return ImmutableWithDocs.builder();
    }
}
