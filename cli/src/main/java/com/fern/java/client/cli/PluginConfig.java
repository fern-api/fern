package com.fern.java.client.cli;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutablePluginConfig.class)
public interface PluginConfig {

    Optional<String> packagePrefix();

    String irFilepath();

    String outputDirectory();

    static ImmutablePluginConfig.IrFilepathBuildStage builder() {
        return ImmutablePluginConfig.builder();
    }
}
