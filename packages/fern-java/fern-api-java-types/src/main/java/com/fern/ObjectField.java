package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableObjectField.class)
@JsonIgnoreProperties({"type"})
public interface ObjectField extends IWithDocs {

    String key();

    TypeReference valueType();

    static ImmutableObjectField.KeyBuildStage builder() {
        return ImmutableObjectField.builder();
    }
}
