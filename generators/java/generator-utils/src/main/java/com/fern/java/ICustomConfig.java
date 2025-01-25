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

package com.fern.java;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Optional;
import org.immutables.value.Value;

public interface ICustomConfig {

    @Value.Default
    @JsonProperty("wrapped-aliases")
    default Boolean wrappedAliases() {
        return false;
    }

    @Value.Default
    @JsonProperty("enable-forward-compatible-enums")
    default Boolean enableForwardCompatibleEnum() {
        return false;
    }

    @Value.Default
    @JsonProperty("generate-unknown-as-json-node")
    default Boolean generateUnknownAsJsonNode() {
        return false;
    }

    @Value.Default
    @JsonProperty("json-include")
    default JsonInclude jsonInclude() {
        return JsonInclude.NON_ABSENT;
    }

    @Value.Default
    @JsonProperty("enable-public-constructors")
    default Boolean enablePublicConstructors() {
        return false;
    }

    @Value.Default
    @JsonProperty("disable-required-property-builder-checks")
    default Boolean disableRequiredPropertyBuilderChecks() {
        return false;
    }

    @Value.Default
    @JsonProperty("inline-path-parameters")
    default Boolean inlinePathParameters() {
        return false;
    }

    @Value.Default
    @JsonProperty("enable-inline-types")
    default Boolean enableInlineTypes() {
        return false;
    }

    @JsonProperty("package-prefix")
    Optional<String> packagePrefix();

    enum JsonInclude {
        NON_EMPTY("non-empty"),
        NON_ABSENT("non-absent");

        private final String value;

        JsonInclude(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }
    }
}
