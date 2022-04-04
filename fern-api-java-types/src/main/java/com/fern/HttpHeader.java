package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableHttpHeader.class)
public interface HttpHeader extends WithDocs {

    String header();

    TypeReference valueType();

    static ImmutableHttpHeader.HeaderBuildStage builder() {
        return ImmutableHttpHeader.builder();
    }
}
