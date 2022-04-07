package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.Optional;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableWebSocketError.class)
public interface WebSocketError extends IWithDocs {

    String name();

    Optional<TypeReference> bodyType();

    static ImmutableWebSocketError.NameBuildStage builder() {
        return ImmutableWebSocketError.builder();
    }
}
