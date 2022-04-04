package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableObjectField.class)
public interface ObjectField extends WithDocs {

    String key();

    TypeReference valueType();

    static ImmutableObjectField.KeyBuildStage builder() {
        return ImmutableObjectField.builder();
    }
}
