package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;
import java.util.Optional;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWebSocketMessage.class)
@JsonIgnoreProperties({"type"})
public interface WebSocketMessage extends IWithDocs {

    WebSocketMessageOrigin origin();

    Optional<WebSocketMessageBody> body();

    Optional<WebSocketMessageResponse> response();

    List<WebSocketError> errors();

    static ImmutableWebSocketMessage.OriginBuildStage builder() {
        return ImmutableWebSocketMessage.builder();
    }
}
