package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableHttpRequest.class)
public interface HttpRequest extends WithDocs {

    TypeReference bodyType();

    static ImmutableHttpRequest.BodyTypeBuildStage builder() {
        return ImmutableHttpRequest.builder();
    }
}
