package com.fern.java.client.cli;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableFernPluginConfig.class)
public interface FernPluginConfig {

    String irFilepath();

    OutputConfig output();

    @JsonProperty("customConfig")
    CustomPluginConfig customPluginConfig();

    @Value.Immutable
    @StagedBuilderStyle
    @JsonDeserialize(as = ImmutableOutputConfig.class)
    interface OutputConfig {
        String path();

        String pathRelativeToRootOnHost();

        static ImmutableOutputConfig.PathBuildStage builder() {
            return ImmutableOutputConfig.builder();
        }
    }

    static ImmutableFernPluginConfig.IrFilepathBuildStage builder() {
        return ImmutableFernPluginConfig.builder();
    }
}
