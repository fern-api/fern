package com.fern.types.ir;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.StagedBuilderStyle;
import com.fern.types.services.http.HttpService;
import com.fern.types.services.websocket.WebSocketChannel;
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

  List<WebSocketChannel> websocket();

  static ImmutableServices.Builder builder() {
    return ImmutableServices.builder();
  }
}
