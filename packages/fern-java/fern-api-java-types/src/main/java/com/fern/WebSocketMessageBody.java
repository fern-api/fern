package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWebSocketMessageBody.class)
@JsonIgnoreProperties({"type"})
public interface WebSocketMessageBody extends IWithDocs {

    TypeReference bodyType();

    static ImmutableWebSocketMessageBody.BodyTypeBuildStage builder() {
        return ImmutableWebSocketMessageBody.builder();
    }
}
