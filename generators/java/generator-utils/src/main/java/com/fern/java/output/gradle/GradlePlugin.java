package com.fern.java.output.gradle;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GradlePlugin {

    public abstract String pluginId();

    public abstract Optional<String> version();

    public static ImmutableGradlePlugin.PluginIdBuildStage builder() {
        return ImmutableGradlePlugin.builder();
    }

    /**
     * Parses a plugin specification string into a GradlePlugin. Format: "plugin-id" or "plugin-id:version"
     *
     * @param value the plugin specification string
     * @return a GradlePlugin instance
     * @throws IllegalArgumentException if the format is invalid
     */
    public static GradlePlugin of(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid custom-plugins entry: plugin specification cannot be empty");
        }

        String trimmed = value.trim();
        int colonIndex = trimmed.indexOf(':');

        // Plugin ID only
        if (colonIndex == -1) {
            return ImmutableGradlePlugin.builder().pluginId(trimmed).build();
        }

        // Validate colon position
        if (colonIndex == 0 || colonIndex == trimmed.length() - 1 || trimmed.indexOf(':', colonIndex + 1) != -1) {
            throw new IllegalArgumentException("Invalid custom-plugins entry: \"" + value + "\"\n"
                    + "Expected format: \"plugin-id\" or \"plugin-id:version\"");
        }

        String pluginId = trimmed.substring(0, colonIndex).trim();
        String version = trimmed.substring(colonIndex + 1).trim();

        if (pluginId.isEmpty() || version.isEmpty()) {
            throw new IllegalArgumentException("Invalid custom-plugins entry: \"" + value + "\"\n"
                    + "Expected format: \"plugin-id\" or \"plugin-id:version\"");
        }

        return ImmutableGradlePlugin.builder()
                .pluginId(pluginId)
                .version(version)
                .build();
    }
}
