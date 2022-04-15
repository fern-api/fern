package com.fern;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableFernFilepath.class)
public interface FernFilepath {

    @JsonValue
    String value();

    default String get() {
        return value();
    }

    static FernFilepath valueOf(String value) {
        return ImmutableFernFilepath.builder().value(value).build();
    }
}
