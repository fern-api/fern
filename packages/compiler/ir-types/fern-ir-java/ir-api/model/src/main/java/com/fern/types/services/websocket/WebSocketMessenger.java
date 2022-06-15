package com.fern.types.services.websocket;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketMessenger.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WebSocketMessenger {
  List<WebSocketOperation> operations();

  static ImmutableWebSocketMessenger.Builder builder() {
    return ImmutableWebSocketMessenger.builder();
  }
}
