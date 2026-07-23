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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.java.ICustomConfig;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
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

    @JsonProperty("default-timeout-in-seconds")
    Optional<Integer> defaultTimeoutInSeconds();

    /**
     * Optional, additive per-phase timeouts (in seconds; fractional values allowed). When set, the granular
     * connect/read/write values are applied to the underlying OkHttp client on top of the existing single overall
     * timeout ({@link #defaultTimeoutInSeconds()} -> {@code callTimeout}). When unset, generated output is unchanged.
     */
    @JsonProperty("timeouts")
    Optional<Timeouts> timeouts();

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    @JsonDeserialize(as = ImmutableTimeouts.class)
    interface Timeouts {
        @JsonProperty("connect")
        Optional<Double> connect();

        @JsonProperty("read")
        Optional<Double> read();

        @JsonProperty("write")
        Optional<Double> write();

        @Value.Check
        default void validate() {
            connect().ifPresent(value -> validateNonNegative("connect", value));
            read().ifPresent(value -> validateNonNegative("read", value));
            write().ifPresent(value -> validateNonNegative("write", value));
        }

        static void validateNonNegative(String name, double value) {
            if (value < 0) {
                throw new IllegalArgumentException("timeouts." + name + " must be non-negative, got: " + value);
            }
        }

        static ImmutableTimeouts.Builder builder() {
            return ImmutableTimeouts.builder();
        }
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

    /**
     * If true, emits a structured {@code User-Agent} header of the form {@code {sdkName}/{sdkVersion} ({os}; {arch})
     * {runtime}/{runtimeVersion}}, with the os, arch, and runtime version resolved at runtime. Opt-in and disabled by
     * default so existing generated output is unchanged. When enabled, the header is still subject to
     * {@link #omitFernHeaders()}.
     */
    @Value.Default
    @JsonProperty("includePlatformHeaders")
    default Boolean includePlatformHeaders() {
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
