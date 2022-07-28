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

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
@JsonDeserialize(as = ImmutableCustomPluginConfig.class)
public interface CustomPluginConfig {

    Optional<String> packagePrefix();

    Optional<String> serverFrameworks();

    default List<ServerFramework> getServerFrameworkEnums() {
        return Arrays.stream(serverFrameworks().orElse("spring").split(","))
                .map(String::toUpperCase)
                .map(ServerFramework::valueOf)
                .collect(Collectors.toList());
    }

    Mode mode();

    enum Mode {
        MODEL,
        CLIENT,
        SERVER,
        CLIENT_AND_SERVER;
    }

    enum ServerFramework {
        JERSEY,
        SPRING
    }

    static ImmutableCustomPluginConfig.ModeBuildStage builder() {
        return ImmutableCustomPluginConfig.builder();
    }
}
