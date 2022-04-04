package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableHttpEndpointParameter.class)
public interface HttpEndpointParameter extends WithDocs {

    String key();

    TypeReference valueType();

    static ImmutableHttpEndpointParameter.KeyBuildStage builder() {
        return ImmutableHttpEndpointParameter.builder();
    }
}
