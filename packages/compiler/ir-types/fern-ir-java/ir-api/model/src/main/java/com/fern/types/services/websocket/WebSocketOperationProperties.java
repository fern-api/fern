package com.fern.types.services.websocket;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketOperationProperties.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WebSocketOperationProperties {
  String id();

  String operation();

  String body();

  static ImmutableWebSocketOperationProperties.IdBuildStage builder() {
    return ImmutableWebSocketOperationProperties.builder();
  }
}
