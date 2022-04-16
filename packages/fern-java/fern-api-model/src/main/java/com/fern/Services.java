package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableServices.class
)
@JsonIgnoreProperties({"_type"})
public interface Services {
  List<HttpService> http();

  List<WebSocketService> webSocket();

  static ImmutableServices.Builder builder() {
    return ImmutableServices.builder();
  }
}
