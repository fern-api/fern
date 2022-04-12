package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableObjectField.class)
public interface SingleUnionType extends IWithDocs {

    String discriminantValue();

    TypeReference valueType();

    static ImmutableSingleUnionType.DiscriminantValueBuildStage builder() {
        return ImmutableSingleUnionType.builder();
    }
}
