package com.services.websocket;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.commons.interfaces.IBaseService;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketService.class
)
@JsonIgnoreProperties(
    ignoreUnknown = {true}
)
public interface WebSocketService extends IBaseService {
  List<WebSocketMessage> messages();

  static ImmutableWebSocketService.BasePathBuildStage builder() {
    return ImmutableWebSocketService.builder();
  }
}
