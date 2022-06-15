package com.fern.types.services.websocket;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.types.Type;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketOkResponse.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WebSocketOkResponse extends IWithDocs {
  Type type();

  static ImmutableWebSocketOkResponse.TypeBuildStage builder() {
    return ImmutableWebSocketOkResponse.builder();
  }
}
