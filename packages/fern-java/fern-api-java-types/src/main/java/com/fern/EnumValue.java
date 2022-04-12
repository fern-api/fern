package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableEnumValue.class)
@JsonIgnoreProperties({"type"})
public interface EnumValue extends IWithDocs {

    String value();

    static ImmutableEnumValue.ValueBuildStage builder() {
        return ImmutableEnumValue.builder();
    }
}
