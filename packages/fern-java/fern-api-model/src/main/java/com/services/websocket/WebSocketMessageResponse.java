package com.services.websocket;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.commons.interfaces.IWireMessage;
import com.types.Type;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketMessageResponse.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface WebSocketMessageResponse extends IWireMessage {
  WebSocketMessageResponseBehavior behavior();

  Type type();

  static ImmutableWebSocketMessageResponse.TypeBuildStage builder() {
    return ImmutableWebSocketMessageResponse.builder();
  }
}
