package com.fern.java.output.gradle;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GradlePublishingConfig {

    public abstract String version();

    public abstract String group();

    public abstract String artifact();

    public static ImmutableGradlePublishingConfig.VersionBuildStage builder() {
        return ImmutableGradlePublishingConfig.builder();
    }
}
