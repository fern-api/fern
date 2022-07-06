/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
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
package com.fern.java.client.cli;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.types.generators.GeneratorConfig;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableFernPluginConfig.class)
public interface FernPluginConfig {

    GeneratorConfig generatorConfig();

    @JsonProperty("customConfig")
    CustomPluginConfig customPluginConfig();

    String version();

    default String getModelProjectName() {
        return getSubProjectName("model");
    }

    default String getClientProjectName() {
        return getSubProjectName("client");
    }

    default String getServerProjectName(CustomPluginConfig.ServerFramework serverFramework) {
        return getSubProjectName("server-" + serverFramework.name().toLowerCase());
    }

    default String getSubProjectName(String projectSuffix) {
        return generatorConfig().workspaceName() + "-" + projectSuffix;
    }

    static FernPluginConfig create(GeneratorConfig generatorConfig, String version) {
        return ImmutableFernPluginConfig.builder()
                .generatorConfig(generatorConfig)
                .customPluginConfig(CustomPluginConfig.builder()
                        .mode(Mode.valueOf(
                                generatorConfig.customConfig().get("mode").toUpperCase()))
                        .packagePrefix(Optional.ofNullable(
                                generatorConfig.customConfig().get("packagePrefix")))
                        .serverFrameworks(Optional.ofNullable(
                                generatorConfig.customConfig().get("serverFrameworks")))
                        .build())
                .version(version)
                .build();
    }
}
