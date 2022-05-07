package com.fern.java.client.cli;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableFernPluginConfig.class)
public interface FernPluginConfig {

    @JsonAlias("workspacePath")
    String relativeWorkspacePathOnHost();

    String irFilepath();

    String outputDirectory();

    @JsonProperty("config")
    CustomPluginConfig customPluginConfig();

    static ImmutableFernPluginConfig.RelativeWorkspacePathOnHostBuildStage builder() {
        return ImmutableFernPluginConfig.builder();
    }
}
