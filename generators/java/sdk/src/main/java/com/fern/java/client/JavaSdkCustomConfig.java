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

    /**
     * If true, the SDK version reported in the telemetry headers ({@code X-Fern-SDK-Version} and the version segment of
     * {@code User-Agent}) is resolved at runtime from the jar manifest's {@code Implementation-Version} attribute
     * instead of being baked in as a literal at generation time. This lets the reported version track the
     * actually-published artifact version (e.g. when an external tool such as release-please sets the published version
     * after generation) rather than a version the SDK may never publish. Falls back to the generation-time version when
     * the manifest attribute is absent (e.g. running from unpackaged classes). Opt-in and disabled by default so
     * existing generated output is unchanged. When enabled, the header is still subject to {@link #omitFernHeaders()}.
     */
    @Value.Default
    @JsonProperty("runtime-version")
    default Boolean runtimeVersion() {
        return false;
    }

    /**
     * If true, the generated client exposes an optional {@code appInfo(name, version, comment)} builder option whose
     * product token is appended to the {@code User-Agent} header the SDK would otherwise send (following RFC 9110
     * §10.1.5), producing e.g. {@code {sdk}/{version} ... partner-app/3.1.0 (+https://partner.example)}.
     * Caller-supplied values are sanitized (name/version percent-encoded to RFC 7230 {@code tchar}s; comment delimiters
     * and control characters escaped). Opt-in and disabled by default so existing generated output is unchanged. The
     * header is still overridable by an explicit {@code User-Agent} and suppressed by {@link #omitFernHeaders()}.
     */
    @Value.Default
    @JsonProperty("allowUserAgentAppInfo")
    default Boolean allowUserAgentAppInfo() {
        return false;
    }

    @Value.Default
    @JsonProperty("retry-status-codes")
    default String retryStatusCodes() {
        return "legacy";
    }

    /**
     * When true, an endpoint whose request body the API does not require also gets an overload without the body
     * parameter, and sends no body when that overload is called. The body parameter keeps its own type. Off by default,
     * so existing signatures are unchanged.
     */
    @Value.Default
    @JsonProperty("respect-optional-request-body")
    default Boolean respectOptionalRequestBody() {
        return false;
    }

    static ImmutableJavaSdkCustomConfig.Builder builder() {
        return ImmutableJavaSdkCustomConfig.builder();
    }
}
