package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketMessageResponse.class
)
@JsonIgnoreProperties({"_type"})
public interface WebSocketMessageResponse extends IWithDocs {
  TypeReference bodyType();

  WebSocketMessageResponseBehavior behavior();

  static ImmutableWebSocketMessageResponse.BodyTypeBuildStage builder() {
    return ImmutableWebSocketMessageResponse.builder();
  }
}
