package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableObjectField.class)
public interface SingleUnionType extends WithDocs {

    String discriminantValue();

    TypeReference valueType();

    static ImmutableSingleUnionType.DiscriminantValueBuildStage builder() {
        return ImmutableSingleUnionType.builder();
    }
}
