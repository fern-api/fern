package com.services.websocket;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.commons.ResponseErrors;
import com.services.commons.WireMessage;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketMessage.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface WebSocketMessage extends IWithDocs {
  WebSocketMessageOrigin origin();

  Optional<WireMessage> body();

  Optional<WebSocketMessageResponse> response();

  ResponseErrors errors();

  static ImmutableWebSocketMessage.OriginBuildStage builder() {
    return ImmutableWebSocketMessage.builder();
  }
}
