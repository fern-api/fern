package com.fern.types.services.websocket;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.types.NamedType;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketChannel.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WebSocketChannel extends IWithDocs {
  NamedType name();

  String path();

  WebSocketMessenger client();

  WebSocketMessenger server();

  WebSocketOperationProperties operationProperties();

  static ImmutableWebSocketChannel.NameBuildStage builder() {
    return ImmutableWebSocketChannel.builder();
  }
}
