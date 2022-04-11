package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableHttpEndpointParameter.class)
public interface HttpEndpointParameter extends IWithDocs {

    String key();

    TypeReference valueType();

    static ImmutableHttpEndpointParameter.KeyBuildStage builder() {
        return ImmutableHttpEndpointParameter.builder();
    }
}
