package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableHttpEndpointQueryParameter.class)
public interface HttpEndpointQueryParameter extends WithDocs {

    String key();

    TypeReference valueType();

    static ImmutableHttpEndpointQueryParameter.KeyBuildStage builder() {
        return ImmutableHttpEndpointQueryParameter.builder();
    }
}
