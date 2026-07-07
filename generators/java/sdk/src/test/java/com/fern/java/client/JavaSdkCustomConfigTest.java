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

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.ir.core.ObjectMappers;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class JavaSdkCustomConfigTest {

    private static JavaSdkCustomConfig parse(Map<String, Object> raw) {
        JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(raw);
        return ObjectMappers.JSON_MAPPER.convertValue(node, JavaSdkCustomConfig.class);
    }

    @Test
    void deprecatedSecondsKeyResolvesToDuration() {
        JavaSdkCustomConfig config = parse(Map.of("default-timeout-in-seconds", 120));

        assertThat(config.defaultTimeout()).isEmpty();
        assertThat(config.defaultTimeoutInSeconds()).contains(120);
        assertThat(config.resolveDefaultTimeout()).contains(Duration.ofSeconds(120));
    }

    @Test
    void newDurationKeyAcceptsNumberOfSeconds() {
        JavaSdkCustomConfig config = parse(Map.of("default-timeout", 30));

        assertThat(config.defaultTimeout()).contains(Duration.ofSeconds(30));
        assertThat(config.resolveDefaultTimeout()).contains(Duration.ofSeconds(30));
    }

    @Test
    void newDurationKeyAcceptsIso8601String() {
        JavaSdkCustomConfig config = parse(Map.of("default-timeout", "PT45S"));

        assertThat(config.defaultTimeout()).contains(Duration.ofSeconds(45));
        assertThat(config.resolveDefaultTimeout()).contains(Duration.ofSeconds(45));
    }

    @Test
    void newDurationKeyTakesPrecedenceOverDeprecatedKey() {
        JavaSdkCustomConfig config = parse(Map.of("default-timeout", "PT10S", "default-timeout-in-seconds", 120));

        assertThat(config.resolveDefaultTimeout()).contains(Duration.ofSeconds(10));
    }

    @Test
    void resolvesToEmptyWhenNeitherKeyIsSet() {
        JavaSdkCustomConfig config = parse(Map.of());

        assertThat(config.defaultTimeout()).isEmpty();
        assertThat(config.defaultTimeoutInSeconds()).isEmpty();
        assertThat(config.resolveDefaultTimeout()).isEqualTo(Optional.empty());
    }
}
