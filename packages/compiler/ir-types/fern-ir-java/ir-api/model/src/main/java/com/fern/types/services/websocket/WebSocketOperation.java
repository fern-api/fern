package com.fern.types.services.websocket;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketOperation.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WebSocketOperation extends IWithDocs {
  String operationId();

  WebSocketRequest request();

  WebSocketResponse response();

  static ImmutableWebSocketOperation.OperationIdBuildStage builder() {
    return ImmutableWebSocketOperation.builder();
  }
}
