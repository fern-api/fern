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

import com.fern.codegen.IGeneratedFile;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.MavenRegistryConfig;
import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.java.client.cli.CustomPluginConfig.ServerFramework;
import java.util.List;
import org.immutables.value.Value;
import org.immutables.value.Value.Style.ImplementationVisibility;

@Value.Immutable
@Value.Style(visibility = ImplementationVisibility.PACKAGE, overshadowImplementation = true)
public abstract class CodeGenerationResult {

    public abstract List<IGeneratedFile> modelFiles();

    public abstract List<IGeneratedFile> clientFiles();

    public abstract List<IGeneratedFile> jerseyServerFiles();

    public abstract List<IGeneratedFile> springServerFiles();

    public static String getModelBuildGradle(FernPluginConfig pluginConfig) {
        return "plugins {\n"
                + "    id 'java-library'\n"
                + "    id \"org.inferred.processors\" version \"3.6.0\"\n"
                + "}\n"
                + "\n"
                + "repositories {\n"
                + "    mavenCentral()\n"
                + "    maven {\n"
                + "        url \"https://s01.oss.sonatype.org/content/repositories/releases/\"\n"
                + "    }\n"
                + "}\n"
                + "\n"
                + "dependencies {\n"
                + "    implementation 'com.fasterxml.jackson.core:jackson-databind:2.12.3'\n"
                + "    implementation 'com.google.code.findbugs:annotations:3.0.1'\n"
                + "    api 'io.github.fern-api:exception-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:immutables-utils:" + pluginConfig.version() + "'\n"
                + "\n"
                + "    annotationProcessor 'org.immutables:value:2.8.8'\n"
                + "    compileOnly 'org.immutables:value-annotations:2.8.8'\n"
                + "}\n";
    }

    public static String getClientBuildGradle(FernPluginConfig pluginConfig) {
        return "plugins {\n"
                + "    id 'java-library'\n"
                + "    id \"org.inferred.processors\" version \"3.6.0\"\n"
                + "}\n"
                + "\n"
                + "repositories {\n"
                + "    mavenCentral()\n"
                + "    maven {\n"
                + "        url \"https://s01.oss.sonatype.org/content/repositories/releases/\"\n"
                + "    }\n"
                + "}\n"
                + "\n"
                + "dependencies {\n"
                + "    api project(':" + pluginConfig.getModelProjectName() + "')\n"
                + "    api 'io.github.fern-api:exception-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:immutables-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:jackson-utils:" + pluginConfig.version() + "'\n"
                + "    implementation 'io.github.fern-api:jersey-utils:" + pluginConfig.version() + "'\n"
                + "    implementation 'com.fasterxml.jackson.core:jackson-databind:2.12.3'\n"
                + "    implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jdk8:2.12.3'\n"
                + "    implementation 'io.github.openfeign:feign-jackson:11.8'\n"
                + "    implementation 'io.github.openfeign:feign-core:11.8'\n"
                + "    implementation 'io.github.openfeign:feign-jaxrs2:11.8'\n"
                + "\n"
                + "    annotationProcessor 'org.immutables:value:2.8.8'\n"
                + "    compileOnly 'org.immutables:value-annotations:2.8.8'\n"
                + "}\n";
    }

    public static String getServerBuildGradle(FernPluginConfig pluginConfig, ServerFramework serverFramework) {
        if (serverFramework.equals(ServerFramework.JERSEY)) {
            return "plugins {\n"
                    + "    id 'java-library'\n"
                    + "    id \"org.inferred.processors\" version \"3.6.0\"\n"
                    + "}\n"
                    + "\n"
                    + "repositories {\n"
                    + "    mavenCentral()\n"
                    + "    maven {\n"
                    + "        url \"https://s01.oss.sonatype.org/content/repositories/releases/\"\n"
                    + "    }\n"
                    + "}\n"
                    + "\n"
                    + "dependencies {\n"
                    + "    api project(':" + pluginConfig.getModelProjectName() + "')\n"
                    + "    api 'io.github.fern-api:exception-utils:" + pluginConfig.version() + "'\n"
                    + "    api 'io.github.fern-api:immutables-utils:" + pluginConfig.version() + "'\n"
                    + "    api 'io.github.fern-api:jackson-utils:" + pluginConfig.version() + "'\n"
                    + "    api 'io.github.fern-api:jersey-utils:" + pluginConfig.version() + "'\n"
                    + "    implementation 'org.slf4j:slf4j-api:1.7.36'\n"
                    + "    implementation 'com.fasterxml.jackson.core:jackson-databind:2.12.3'\n"
                    + "    implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jdk8:2.12.3'\n"
                    + "    implementation 'io.github.openfeign:feign-jackson:11.8'\n"
                    + "    implementation 'io.github.openfeign:feign-core:11.8'\n"
                    + "    implementation 'io.github.openfeign:feign-jaxrs2:11.8'\n"
                    + "    implementation 'org.glassfish.jersey.ext:jersey-spring5:2.35'\n"
                    + "\n"
                    + "    annotationProcessor 'org.immutables:value:2.8.8'\n"
                    + "    compileOnly 'org.immutables:value-annotations:2.8.8'\n"
                    + "}\n";
        } else {
            return "plugins {\n"
                    + "    id 'java-library'\n"
                    + "    id \"org.inferred.processors\" version \"3.6.0\"\n"
                    + "}\n"
                    + "\n"
                    + "repositories {\n"
                    + "    mavenCentral()\n"
                    + "    maven {\n"
                    + "        url \"https://s01.oss.sonatype.org/content/repositories/releases/\"\n"
                    + "    }\n"
                    + "}\n"
                    + "\n"
                    + "dependencies {\n"
                    + "    api project(':" + pluginConfig.getModelProjectName() + "')\n"
                    + "    api 'io.github.fern-api:exception-utils:" + pluginConfig.version() + "'\n"
                    + "    api 'io.github.fern-api:immutables-utils:" + pluginConfig.version() + "'\n"
                    + "    api 'io.github.fern-api:jackson-utils:" + pluginConfig.version() + "'\n"
                    + "    api 'io.github.fern-api:spring-utils:" + pluginConfig.version() + "'\n"
                    + "    implementation 'org.slf4j:slf4j-api:1.7.36'\n"
                    + "    implementation 'com.fasterxml.jackson.core:jackson-databind:2.12.3'\n"
                    + "    implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jdk8:2.12.3'\n"
                    + "    implementation 'org.springframework:spring-web:5.3.19'\n"
                    + "    implementation 'org.springframework:spring-webmvc:5.3.19'\n"
                    + "\n"
                    + "    annotationProcessor 'org.immutables:value:2.8.8'\n"
                    + "    compileOnly 'org.immutables:value-annotations:2.8.8'\n"
                    + "}\n";
        }
    }

    public static String getSettingsDotGradle(FernPluginConfig fernPluginConfig) {
        Mode mode = fernPluginConfig.customPluginConfig().mode();
        String settingsGradle = "rootProject.name = 'fern-generated-java'\n"
                + "\n"
                + "include '" + fernPluginConfig.getModelProjectName() + "'\n";

        if (mode.equals(Mode.CLIENT_AND_SERVER) || mode.equals(Mode.CLIENT)) {
            settingsGradle += "include '" + fernPluginConfig.getClientProjectName() + "'\n";
        }
        if (mode.equals(Mode.CLIENT_AND_SERVER) || mode.equals(Mode.SERVER)) {
            for (ServerFramework serverFramework :
                    fernPluginConfig.customPluginConfig().getServerFrameworkEnums()) {
                settingsGradle += "include '" + fernPluginConfig.getServerProjectName(serverFramework) + "'\n";
            }
        }
        return settingsGradle;
    }

    public static String getBuildDotGradle(GeneratorPublishConfig publishConfig) {
        MavenRegistryConfig mavenRegistryConfig = publishConfig.getRegistries().getMaven();
        return "plugins {\n"
                + "    id 'maven-publish'\n"
                + "}\n"
                + "\n"
                + "subprojects {\n"
                + "\n"
                + "    group '" + publishConfig.getRegistries().getMaven().getGroup() + "'\n"
                + "    version '" + publishConfig.getVersion() + "'\n"
                + "\n"
                + "    apply plugin: \"maven-publish\"\n"
                + "    apply plugin: \"java-library\"\n"
                + "\n"
                + "    java {\n"
                + "        withSourcesJar()\n"
                + "        withJavadocJar()\n"
                + "    }"
                + "\n"
                + "    publishing {\n"
                + "        publications {\n"
                + "            mavenJava(MavenPublication) {\n"
                + "                from components.java\n"
                + "            }\n"
                + "        }\n"
                + "        repositories {\n"
                + "            maven {\n"
                + "                url '" + mavenRegistryConfig.getRegistryUrl() + "'\n"
                + "                credentials {\n"
                + "                    username '" + mavenRegistryConfig.getUsername() + "'\n"
                + "                    password '" + mavenRegistryConfig.getPassword() + "'\n"
                + "                }\n"
                + "            }\n"
                + "        }\n"
                + "    }\n"
                + "}\n"
                + "\n";
    }

    public static String getGitignore() {
        return "*.class\n"
                + ".project\n"
                + ".gradle\n"
                + ".classpath\n"
                + ".checkstyle\n"
                + ".settings\n"
                + ".node\n"
                + "build\n"
                + "\n"
                + "# IntelliJ\n"
                + "*.iml\n"
                + "*.ipr\n"
                + "*.iws\n"
                + ".idea/\n"
                + "out/\n"
                + "\n"
                + "# Eclipse/IntelliJ APT\n"
                + "generated_src/\n"
                + "generated_testSrc/\n"
                + "generated/\n"
                + "\n"
                + "bin\n"
                + "build";
    }

    static ImmutableCodeGenerationResult.Builder builder() {
        return ImmutableCodeGenerationResult.builder();
    }
}
