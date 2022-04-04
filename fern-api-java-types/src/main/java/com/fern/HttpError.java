package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.Optional;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableHttpError.class)
public interface HttpError extends WithDocs {

    String name();

    int statusCode();

    Optional<TypeReference> bodyType();

    static ImmutableHttpError.NameBuildStage builder() {
        return ImmutableHttpError.builder();
    }
}
