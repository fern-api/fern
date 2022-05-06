package com.fern.java.client.cli;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableCustomPluginConfig.class)
public interface CustomPluginConfig {

    Optional<String> packagePrefix();

    Mode mode();

    enum Mode {
        MODEL,
        CLIENT,
        SERVER,
        CLIENT_AND_SERVER;
    }

    static ImmutableCustomPluginConfig.ModeBuildStage builder() {
        return ImmutableCustomPluginConfig.builder();
    }
}
