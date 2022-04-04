package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableWebSocketService.class)
public interface WebSocketService extends BaseService {

    List<WebSocketMessage> messages();

    static ImmutableWebSocketService.NameBuildStage builder() {
        return ImmutableWebSocketService.builder();
    }
}
