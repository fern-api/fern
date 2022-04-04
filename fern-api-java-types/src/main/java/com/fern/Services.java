package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableServices.class)
public interface Services {

    List<HttpService> http();

    List<WebSocketService> webSocket();

    static ImmutableServices.Builder builder() {
        return ImmutableServices.builder();
    }
}
