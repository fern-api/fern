package com.fern.java.output.gradle;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GradleRepository {

    public abstract String url();

    public static ImmutableGradleRepository.UrlBuildStage builder() {
        return ImmutableGradleRepository.builder();
    }
}
