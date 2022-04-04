package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableWebSocketMessageBody.class)
public interface WebSocketMessageResponse extends WithDocs {

    TypeReference bodyType();

    WebSocketMessageResponseBehavior behavior();

    static ImmutableWebSocketMessageResponse.BodyTypeBuildStage builder() {
        return ImmutableWebSocketMessageResponse.builder();
    }
}
