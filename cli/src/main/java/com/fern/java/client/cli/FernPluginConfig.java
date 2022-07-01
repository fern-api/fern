package com.fern.java.client.cli;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.types.generators.config.GeneratorConfig;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableFernPluginConfig.class)
public interface FernPluginConfig {

    GeneratorConfig generatorConfig();

    @JsonProperty("customConfig")
    CustomPluginConfig customPluginConfig();

    String version();

    default String getModelProjectName() {
        return getSubProjectName("model");
    }

    default String getClientProjectName() {
        return getSubProjectName("client");
    }

    default String getServerProjectName() {
        return getSubProjectName("server");
    }

    default String getSubProjectName(String projectSuffix) {
        return generatorConfig().workspaceName() + "-" + projectSuffix;
    }

    static FernPluginConfig create(GeneratorConfig generatorConfig, String version) {
        return ImmutableFernPluginConfig.builder()
                .generatorConfig(generatorConfig)
                .customPluginConfig(CustomPluginConfig.builder()
                        .mode(Mode.valueOf(
                                generatorConfig.customConfig().get("mode").toUpperCase()))
                        .packagePrefix(Optional.ofNullable(
                                generatorConfig.customConfig().get("packagePrefix")))
                        .build())
                .version(version)
                .build();
    }
}
