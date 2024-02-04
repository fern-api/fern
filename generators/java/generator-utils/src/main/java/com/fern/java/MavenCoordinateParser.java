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
