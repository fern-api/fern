package com.fern.model.codegen;

import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface ModelGeneratorConfig {

    boolean serverSideErrors();

    static ImmutableModelGeneratorConfig.ServerSideErrorsBuildStage builder() {
        return ImmutableModelGeneratorConfig.builder();
    }
}
