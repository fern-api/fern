package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableEnumTypeDefinition.class)
public interface EnumTypeDefinition {

    List<EnumValue> values();

    static ImmutableEnumTypeDefinition.Builder builder() {
        return ImmutableEnumTypeDefinition.builder();
    }
}
