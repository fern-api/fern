package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableBaseService.class)
public interface BaseService extends WithPackage, WithDocs {

    String name();

    String basePath();

    static ImmutableBaseService.NameBuildStage builder() {
        return ImmutableBaseService.builder();
    }
}
