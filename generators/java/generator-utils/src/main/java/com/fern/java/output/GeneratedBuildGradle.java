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

package com.fern.java.output;

import com.fern.java.output.gradle.AbstractGradleDependency;
import com.fern.java.output.gradle.GradlePlugin;
import com.fern.java.output.gradle.GradlePublishingConfig;
import com.fern.java.output.gradle.GradleRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
public abstract class GeneratedBuildGradle extends GeneratedFile {

    public static final String MAVEN_USERNAME_ENV_VAR = "MAVEN_USERNAME";
    public static final String MAVEN_PASSWORD_ENV_VAR = "MAVEN_PASSWORD";
    public static final String MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR = "MAVEN_PUBLISH_REGISTRY_URL";
    public static final String JAVA_LIBRARY_PLUGIN_ID = "java-library";
    public static final String MAVEN_PUBLISH_PLUGIN_ID = "maven-publish";

    public abstract List<GradlePlugin> plugins();

    public abstract List<String> customBlocks();

    public abstract List<GradleRepository> customRepositories();

    public abstract List<AbstractGradleDependency> dependencies();

    public abstract Optional<GradlePublishingConfig> gradlePublishingConfig();

    @Override
    public final String filename() {
        return "build.gradle";
    }

    public final String getContents() {
        RawFileWriter writer = new RawFileWriter();
        if (!plugins().isEmpty()) {
            writer.beginControlFlow("plugins");
            for (GradlePlugin gradlePlugin : plugins()) {
                String pluginLine = "id '" + gradlePlugin.pluginId() + "'";
                if (gradlePlugin.version().isPresent()) {
                    pluginLine += " version '" + gradlePlugin.version().get() + "'";
                }
                writer.addLine(pluginLine);
            }
            writer.endControlFlow();
        }
        writer.addNewLine();

        // add repositories
        writer.beginControlFlow("repositories");
        writer.addLine("mavenCentral()");
        for (GradleRepository gradleRepository : customRepositories()) {
            writer.beginControlFlow("maven");
            writer.addLine("url '" + gradleRepository.url() + "'");
            writer.endControlFlow();
        }
        writer.endControlFlow();
        writer.addNewLine();

        // add dependencies
        writer.beginControlFlow("dependencies");
        for (AbstractGradleDependency gradleDependency : dependencies()) {
            writer.addLine(gradleDependency.toString());
        }
        writer.endControlFlow();
        writer.addNewLine();

        writer.addNewLine();
        writer.addLine("sourceCompatibility = 1.8");
        writer.addLine("targetCompatibility = 1.8");
        writer.addNewLine();

        customBlocks().forEach(writer::addLine);

        // add publishing
        if (gradlePublishingConfig().isPresent()) {
            writer.beginControlFlow("publishing");

            writer.beginControlFlow("publications");
            writer.beginControlFlow("maven(MavenPublication)");
            writer.addLine("groupId = '" + gradlePublishingConfig().get().group() + "'");
            writer.addLine("artifactId = '" + gradlePublishingConfig().get().artifact() + "'");
            writer.addLine("version = '" + gradlePublishingConfig().get().version() + "'");
            writer.addLine("from components.java");
            writer.endControlFlow();
            writer.endControlFlow();

            writer.beginControlFlow("repositories");
            writer.beginControlFlow("maven");
            writer.addLine("url \"$System.env." + MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR + "\"");
            writer.beginControlFlow("credentials");
            writer.addLine("username \"$System.env." + MAVEN_USERNAME_ENV_VAR + "\"");
            writer.addLine("password \"$System.env." + MAVEN_PASSWORD_ENV_VAR + "\"");
            writer.endControlFlow();
            writer.endControlFlow();
            writer.endControlFlow();

            writer.endControlFlow();
            writer.addNewLine();
        }
        return writer.getContents();
    }

    public final void writeToFile(Path directory, boolean _isLocal, Optional<String> _existingPrefix)
            throws IOException {
        Files.writeString(directory.resolve("build.gradle"), getContents());
    }

    public static ImmutableGeneratedBuildGradle.Builder builder() {
        return ImmutableGeneratedBuildGradle.builder();
    }
}
