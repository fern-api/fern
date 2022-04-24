package com.fern;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.http.HttpService;
import com.services.websocket.WebSocketService;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableServices.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface Services {
  List<HttpService> http();

  List<WebSocketService> websocket();

  static ImmutableServices.Builder builder() {
    return ImmutableServices.builder();
  }
}
