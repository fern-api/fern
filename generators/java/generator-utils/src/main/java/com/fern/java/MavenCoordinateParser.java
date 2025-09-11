package com.fern.java;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

public final class MavenCoordinateParser {

    private MavenCoordinateParser() {}

    public static MavenArtifactAndGroup parse(String coordinate) {
        if (coordinate == null || coordinate.trim().isEmpty()) {
            throw new IllegalArgumentException("Maven coordinate cannot be null or empty");
        }
        
        String[] splitCoordinate = coordinate.split(":");
        if (splitCoordinate.length != 2) {
            throw new IllegalArgumentException(
                "Invalid maven coordinate format. Expected 'groupId:artifactId', got: " + coordinate
            );
        }
        
        String group = splitCoordinate[0].trim();
        String artifact = splitCoordinate[1].trim();
        
        if (group.isEmpty() || artifact.isEmpty()) {
            throw new IllegalArgumentException(
                "Group ID and Artifact ID cannot be empty in coordinate: " + coordinate
            );
        }
        
        if (!group.matches("[a-zA-Z0-9._-]+") || !artifact.matches("[a-zA-Z0-9._-]+")) {
            throw new IllegalArgumentException(
                "Invalid characters in Maven coordinate: " + coordinate
            );
        }
        
        return MavenArtifactAndGroup.builder()
                .group(group)
                .artifact(artifact)
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
