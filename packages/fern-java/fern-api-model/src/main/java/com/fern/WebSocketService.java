package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IBaseService;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebSocketService.class
)
@JsonIgnoreProperties({"_type"})
public interface WebSocketService extends IBaseService {
  List<WebSocketMessage> messages();

  static ImmutableWebSocketService.NameBuildStage builder() {
    return ImmutableWebSocketService.builder();
  }
}
