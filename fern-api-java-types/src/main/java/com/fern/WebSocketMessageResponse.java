package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWebSocketMessageBody.class)
public interface WebSocketMessageResponse extends IWithDocs {

    TypeReference bodyType();

    WebSocketMessageResponseBehavior behavior();

    static ImmutableWebSocketMessageResponse.BodyTypeBuildStage builder() {
        return ImmutableWebSocketMessageResponse.builder();
    }
}
