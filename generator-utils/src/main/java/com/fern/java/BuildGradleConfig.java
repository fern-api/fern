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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface BuildGradleConfig {

    List<String> dependencies();

    Optional<PublishingConfig> publishing();

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface PublishingConfig {
        String version();

        String registryUrl();

        String registryUsername();

        String registryPassword();

        String group();

        String artifact();

        static ImmutablePublishingConfig.VersionBuildStage builder() {
            return ImmutablePublishingConfig.builder();
        }
    }

    default String getFileContents() {
        String dependencies = "dependencies {\n" + dependencies().stream().collect(Collectors.joining("\n")) + "\n}\n";
        String result = "plugins {\n"
                + "    id 'java-library'\n"
                + "    id 'maven-publish'\n"
                + "}\n"
                + "\n"
                + "java {\n"
                + "    withSourcesJar()\n"
                + "    withJavadocJar()\n"
                + "}\n"
                + "\n"
                + "repositories {\n"
                + "    mavenCentral()\n"
                + "    maven {\n"
                + "        url \"https://s01.oss.sonatype.org/content/repositories/releases/\"\n"
                + "    }\n"
                + "}\n"
                + "\n"
                + dependencies;
        if (publishing().isPresent()) {
            PublishingConfig publishingConfig = publishing().get();
            result += "publishing {\n"
                    + "    publications {\n"
                    + "        maven(MavenPublication) {\n"
                    + "            groupId = '" + publishingConfig.group() + "'\n"
                    + "            artifactId = '" + publishingConfig.artifact() + "'\n"
                    + "            version = '" + publishingConfig.version() + "'\n"
                    + "\n"
                    + "            from components.java\n"
                    + "        }\n"
                    + "    }\n"
                    + "    repositories {\n"
                    + "        maven {\n"
                    + "            url '" + publishingConfig.registryUrl() + "'\n"
                    + "            credentials {\n"
                    + "                username '" + publishingConfig.registryUsername() + "'\n"
                    + "                password '" + publishingConfig.registryPassword() + "'\n"
                    + "            }\n"
                    + "        }\n"
                    + "    }\n"
                    + "}\n"
                    + "\n";
        }
        return result;
    }

    static ImmutableBuildGradleConfig.Builder builder() {
        return ImmutableBuildGradleConfig.builder();
    }
}
