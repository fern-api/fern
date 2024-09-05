package com.fern.java;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
@JsonDeserialize(as = ImmutableDownloadFilesCustomConfig.class)
public interface DownloadFilesCustomConfig {

    @Value.Default
    @JsonProperty("unknown-as-optional")
    default Boolean unknownAsOptional() {
        return false;
    }

    @JsonProperty("package-prefix")
    Optional<String> packagePrefix();

    static ImmutableDownloadFilesCustomConfig.Builder builder() {
        return ImmutableDownloadFilesCustomConfig.builder();
    }
}
