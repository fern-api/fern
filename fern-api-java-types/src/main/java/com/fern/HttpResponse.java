package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableHttpResponse.class)
public interface HttpResponse {

    TypeReference bodyType();

    static ImmutableHttpResponse.BodyTypeBuildStage builder() {
        return ImmutableHttpResponse.builder();
    }
}
