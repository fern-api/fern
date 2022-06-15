package com.fern.types.services.websocket;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import com.fern.types.services.commons.Encoding;
import com.fern.types.services.commons.FailedResponse;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketResponse.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WebSocketResponse extends IWithDocs {
  Encoding encoding();

  WebSocketOkResponse ok();

  FailedResponse failed();

  static ImmutableWebSocketResponse.EncodingBuildStage builder() {
    return ImmutableWebSocketResponse.builder();
  }
}
