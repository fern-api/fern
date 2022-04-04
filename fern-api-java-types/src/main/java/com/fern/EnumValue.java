package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableEnumValue.class)
public interface EnumValue extends WithDocs {

    String value();

    static ImmutableEnumValue.ValueBuildStage builder() {
        return ImmutableEnumValue.builder();
    }
}
