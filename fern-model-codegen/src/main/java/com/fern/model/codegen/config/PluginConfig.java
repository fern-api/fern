package com.fern.model.codegen.config;

import com.fern.immutables.StagedBuilderStyle;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface PluginConfig {

    Optional<String> packagePrefix();

    @Value.Default
    default String modelSubprojectDirectoryName() {
        return "model";
    }

    static ImmutablePluginConfig.Builder builder() {
        return ImmutablePluginConfig.builder();
    }
}
