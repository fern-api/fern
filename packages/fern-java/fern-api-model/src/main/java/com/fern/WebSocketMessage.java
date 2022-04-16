package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketMessage.class
)
@JsonIgnoreProperties({"_type"})
public interface WebSocketMessage extends IWithDocs {
  WebSocketMessageOrigin origin();

  Optional<WebSocketMessageBody> body();

  Optional<WebSocketMessageResponse> response();

  List<WebsocketError> errors();

  static ImmutableWebSocketMessage.OriginBuildStage builder() {
    return ImmutableWebSocketMessage.builder();
  }
}
