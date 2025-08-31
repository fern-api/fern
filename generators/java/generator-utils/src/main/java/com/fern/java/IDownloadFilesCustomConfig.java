package com.fern.java;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Optional;
import org.immutables.value.Value;

public interface IDownloadFilesCustomConfig {
    @Value.Default
    @JsonProperty("unknown-as-optional")
    default Boolean unknownAsOptional() {
        return false;
    }

    @Value.Default
    @JsonProperty("wrapped-aliases")
    default Boolean wrappedAliases() {
        return false;
    }

    @Value.Default
    @JsonProperty("use-default-request-parameter-values")
    default Boolean useDefaultRequestParameterValues() {
        return false;
    }

    @Value.Default
    @JsonProperty("enable-wire-tests")
    default Boolean enableWireTests() {
        return false;
    }

    @Value.Default
    @JsonProperty("use-nullable-annotation")
    default Boolean useNullableAnnotation() {
        return false;
    }

    @JsonProperty("package-prefix")
    Optional<String> packagePrefix();

    @Value.Default
    @JsonProperty("package-layout")
    default ICustomConfig.PackageLayout packageLayout() {
        return ICustomConfig.PackageLayout.NESTED;
    }
}
