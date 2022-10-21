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

package com.fern.java;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

public final class MavenCoordinateParser {

    private MavenCoordinateParser() {}

    public static MavenArtifactAndGroup parse(String coordinate) {
        String[] splitCoordinate = coordinate.split(":");
        if (splitCoordinate.length < 2) {
            throw new IllegalStateException("Received invalid maven coordinate: " + coordinate);
        }
        return MavenArtifactAndGroup.builder()
                .group(splitCoordinate[0])
                .artifact(splitCoordinate[1])
                .build();
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface MavenArtifactAndGroup {

        String group();

        String artifact();

        static ImmutableMavenArtifactAndGroup.GroupBuildStage builder() {
            return ImmutableMavenArtifactAndGroup.builder();
        }
    }
}
