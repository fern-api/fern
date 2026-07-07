/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.fern.java.client;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.java.ICustomConfig;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
@JsonDeserialize(as = ImmutableJavaSdkCustomConfig.class)
public interface JavaSdkCustomConfig extends ICustomConfig {

    @Override
    @Value.Default
    @JsonProperty("enable-forward-compatible-enums")
    default Boolean enableForwardCompatibleEnum() {
        return true;
    }

    @JsonProperty("client-class-name")
    Optional<String> clientClassName();

    @JsonProperty("base-api-exception-class-name")
    Optional<String> baseApiExceptionClassName();

    @JsonProperty("base-exception-class-name")
    Optional<String> baseExceptionClassName();

    @JsonProperty("custom-dependencies")
    Optional<List<String>> customDependencies();

    @JsonProperty("publish-to")
    Optional<String> publishTo();

    @Value.Check
    default void validatePublishTo() {
        if (publishTo().isPresent()) {
            String value = publishTo().get();
            if (!value.equals("central") && !value.equals("ossrh")) {
                throw new IllegalArgumentException("publish-to must be either 'central' or 'ossrh', got: " + value);
            }
        }
    }

    @JsonProperty("inline-file-properties")
    @Value.Default
    default boolean inlineFileProperties() {
        return false;
    }

    @JsonProperty("custom-pager-name")
    Optional<String> customPagerName();

    @JsonProperty("offset-semantics")
    Optional<String> offsetSemantics();

    /**
     * The default network timeout for generated clients, expressed as a {@link java.time.Duration}. The unit is
     * intentionally omitted from the key name because {@code Duration} is the idiomatic Java representation. Accepts a
     * plain number of seconds, an ISO-8601 duration string (e.g. {@code "PT30S"}), or the literal {@code "infinity"} to
     * disable the timeout.
     */
    @JsonProperty("default-timeout")
    Optional<DefaultTimeout> defaultTimeout();

    /**
     * @deprecated Use {@code default-timeout} ({@link #defaultTimeout()}) instead. This key is retained for backwards
     *     compatibility: when it is set (and {@code default-timeout} is not), its value is interpreted as a number of
     *     seconds.
     */
    @Deprecated
    @JsonProperty("default-timeout-in-seconds")
    Optional<Integer> defaultTimeoutInSeconds();

    /**
     * Resolves the effective default timeout, preferring the idiomatic {@code default-timeout} key and falling back to
     * the deprecated {@code default-timeout-in-seconds} (interpreted as seconds) when only the latter is set. Returns
     * {@link Optional#empty()} when neither key is configured, in which case callers should apply the default of 60
     * seconds.
     */
    @JsonIgnore
    default Optional<DefaultTimeout> resolveDefaultTimeout() {
        if (defaultTimeout().isPresent()) {
            return defaultTimeout();
        }
        return defaultTimeoutInSeconds().map(seconds -> DefaultTimeout.ofDuration(Duration.ofSeconds((long) seconds)));
    }

    @Override
    @Value.Default
    @JsonProperty("collapse-optional-nullable")
    default Boolean collapseOptionalNullable() {
        return false;
    }

    @Override
    @JsonProperty("gradle-distribution-url")
    Optional<String> gradleDistributionUrl();

    @Override
    @JsonProperty("gradle-plugin-management")
    Optional<String> gradlePluginManagement();

    @Override
    @Value.Default
    @JsonProperty("gradle-central-dependency-management")
    default Boolean gradleCentralDependencyManagement() {
        return false;
    }

    /**
     * If true, expose an {@code addInterceptor(Interceptor)} method on the client builder that allows SDK users to add
     * custom OkHttp interceptors (e.g., for PKCV client validation). The interceptors are applied to the OkHttpClient
     * when building the client.
     */
    @Value.Default
    @JsonProperty("custom-interceptors")
    default Boolean customInterceptors() {
        return false;
    }

    /**
     * If true, omits Fern platform headers (X-Fern-Language, SDK name/version, User-Agent) from generated SDK requests.
     */
    @Value.Default
    @JsonProperty("omit-fern-headers")
    default Boolean omitFernHeaders() {
        return false;
    }

    @Value.Default
    @JsonProperty("retry-status-codes")
    default String retryStatusCodes() {
        return "legacy";
    }

    static ImmutableJavaSdkCustomConfig.Builder builder() {
        return ImmutableJavaSdkCustomConfig.builder();
    }
}
