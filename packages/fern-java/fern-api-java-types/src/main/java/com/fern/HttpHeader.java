package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableHttpHeader.class)
public interface HttpHeader extends IWithDocs {

    String header();

    TypeReference valueType();

    static ImmutableHttpHeader.HeaderBuildStage builder() {
        return ImmutableHttpHeader.builder();
    }
}
