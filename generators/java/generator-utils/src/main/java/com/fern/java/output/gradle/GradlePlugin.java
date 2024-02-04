package com.fern.java.output.gradle;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GradlePlugin {

    public abstract String pluginId();

    public abstract Optional<String> version();

    public static ImmutableGradlePlugin.PluginIdBuildStage builder() {
        return ImmutableGradlePlugin.builder();
    }
}
