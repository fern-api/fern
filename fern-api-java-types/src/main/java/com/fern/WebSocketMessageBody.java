package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableWebSocketMessageBody.class)
public interface WebSocketMessageBody extends WithDocs {

    TypeReference bodyType();

    static ImmutableWebSocketMessageBody.BodyTypeBuildStage builder() {
        return ImmutableWebSocketMessageBody.builder();
    }
}
