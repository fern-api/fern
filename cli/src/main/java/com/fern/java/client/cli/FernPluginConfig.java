package com.fern.java.client.cli;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableFernPluginConfig.class)
public interface FernPluginConfig {

    Optional<String> name();

    String irFilepath();

    OutputConfig output();

    Optional<PublishConfig> publish();

    @JsonProperty("customConfig")
    CustomPluginConfig customPluginConfig();

    @Value.Immutable
    @StagedBuilderStyle
    @JsonDeserialize(as = ImmutablePublishConfig.class)
    interface PublishConfig {
        String username();

        String password();

        String url();

        String version();

        String coordinate();

        static ImmutablePublishConfig.UsernameBuildStage builder() {
            return ImmutablePublishConfig.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderStyle
    @JsonDeserialize(as = ImmutableOutputConfig.class)
    interface OutputConfig {
        String path();

        static ImmutableOutputConfig.PathBuildStage builder() {
            return ImmutableOutputConfig.builder();
        }
    }

    default String getModelProjectName() {
        return getProjectName("model");
    }

    default String getClientProjectName() {
        return getProjectName("client");
    }

    default String getServerProjectName() {
        return getProjectName("server");
    }

    default String getProjectName(String projectSuffix) {
        if (name().isPresent()) {
            return name().get() + "-" + projectSuffix;
        }
        return projectSuffix;
    }

    static ImmutableFernPluginConfig.IrFilepathBuildStage builder() {
        return ImmutableFernPluginConfig.builder();
    }
}
