package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWebSocketService.class)
@JsonIgnoreProperties({"type"})
public interface WebSocketService extends IBaseService {

    List<WebSocketMessage> messages();

    static ImmutableWebSocketService.NameBuildStage builder() {
        return ImmutableWebSocketService.builder();
    }
}
