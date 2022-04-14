package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWithDocs.class)
@JsonIgnoreProperties({"type"})
public interface WithDocs extends IWithDocs {

    static ImmutableWithDocs.Builder builder() {
        return ImmutableWithDocs.builder();
    }
}
