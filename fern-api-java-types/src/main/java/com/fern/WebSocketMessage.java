package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.List;
import java.util.Optional;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableWebSocketMessage.class)
public interface WebSocketMessage extends WithDocs {

    WebSocketMessageOrigin origin();

    Optional<WebSocketMessageBody> body();

    Optional<WebSocketMessageResponse> response();

    List<WebSocketError> errors();

    static ImmutableWebSocketMessage.OriginBuildStage builder() {
        return ImmutableWebSocketMessage.builder();
    }
}
