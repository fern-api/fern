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
import com.fern.java.IDownloadFilesCustomConfig;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
@JsonDeserialize(as = ImmutableJavaSdkDownloadFilesCustomConfig.class)
public interface JavaSdkDownloadFilesCustomConfig extends IDownloadFilesCustomConfig {

    @JsonProperty("client-class-name")
    Optional<String> clientClassName();

    @JsonProperty("base-api-exception-class-name")
    Optional<String> baseApiExceptionClassName();

    @JsonProperty("base-exception-class-name")
    Optional<String> baseExceptionClassName();

    @JsonProperty("custom-dependencies")
    Optional<List<String>> customDependencies();

    @Value.Default
    @JsonProperty("collapse-optional-nullable")
    default Boolean collapseOptionalNullable() {
        return false;
    }

    static ImmutableJavaSdkDownloadFilesCustomConfig.Builder builder() {
        return ImmutableJavaSdkDownloadFilesCustomConfig.builder();
    }
}
