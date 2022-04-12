package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.Optional;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableHttpError.class)
public interface HttpError extends IWithDocs {

    String name();

    int statusCode();

    Optional<TypeReference> bodyType();

    static ImmutableHttpError.NameBuildStage builder() {
        return ImmutableHttpError.builder();
    }
}
