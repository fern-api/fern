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
import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.java.client.cli.CustomPluginConfig.ServerFramework;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.types.generators.GeneratorConfig;
import com.fiddle.generator.logging.types.MavenCoordinate;
import com.fiddle.generator.logging.types.PackageCoordinate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
@JsonDeserialize(as = ImmutableFernPluginConfig.class)
public interface FernPluginConfig {

    GeneratorConfig generatorConfig();

    @JsonProperty("customConfig")
    CustomPluginConfig customPluginConfig();

    String version();

    default List<PackageCoordinate> getPackageCoordinates() {
        List<PackageCoordinate> result = new ArrayList<>();
        Optional<PackageCoordinate> modelCoordinate = getPackageCoordinate(getModelProjectName());
        Optional<PackageCoordinate> clientCoordinate = getPackageCoordinate(getClientProjectName());

        Map<ServerFramework, Optional<PackageCoordinate>> serverPackageCoordinates = new HashMap<>();
        for (ServerFramework serverFramework : customPluginConfig().getServerFrameworkEnums()) {
            serverPackageCoordinates.put(serverFramework, getPackageCoordinate(getServerProjectName(serverFramework)));
        }
        switch (customPluginConfig().mode()) {
            case MODEL:
                modelCoordinate.ifPresent(result::add);
                break;
            case CLIENT:
                modelCoordinate.ifPresent(result::add);
                clientCoordinate.ifPresent(result::add);
                break;
            case SERVER:
                modelCoordinate.ifPresent(result::add);
                customPluginConfig().getServerFrameworkEnums().forEach(serverFramework -> serverPackageCoordinates
                        .get(serverFramework)
                        .ifPresent(result::add));
                break;
            case CLIENT_AND_SERVER:
                modelCoordinate.ifPresent(result::add);
                clientCoordinate.ifPresent(result::add);
                customPluginConfig().getServerFrameworkEnums().forEach(serverFramework -> serverPackageCoordinates
                        .get(serverFramework)
                        .ifPresent(result::add));
                break;
        }
        return result;
    }

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

    default Optional<PackageCoordinate> getPackageCoordinate(String projectName) {
        return generatorConfig()
                .publish()
                .map(generatorPublishConfig -> PackageCoordinate.maven(MavenCoordinate.builder()
                        .group(generatorPublishConfig.registries().maven().group())
                        .artifact(projectName)
                        .version(generatorPublishConfig.version())
                        .build()));
    }

    static FernPluginConfig create(GeneratorConfig generatorConfig, String version) {
        Map<String, Object> customConfig =
                (Map<String, Object>) generatorConfig.customConfig().get();
        return ImmutableFernPluginConfig.builder()
                .generatorConfig(generatorConfig)
                .customPluginConfig(CustomPluginConfig.builder()
                        .mode(Mode.valueOf(((String) customConfig.get("mode")).toUpperCase()))
                        .serverFrameworks(Optional.ofNullable((String) customConfig.get("serverFrameworks")))
                        .build())
                .version(version)
                .build();
    }
}
