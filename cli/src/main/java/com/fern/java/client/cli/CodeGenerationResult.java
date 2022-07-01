package com.fern.java.client.cli;

import com.fern.codegen.IGeneratedFile;
import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.types.generators.config.GeneratorPublishConfig;
import com.fern.types.generators.config.MavenRegistryConfig;
import java.util.List;
import org.immutables.value.Value;
import org.immutables.value.Value.Style.ImplementationVisibility;

@Value.Immutable
@Value.Style(visibility = ImplementationVisibility.PACKAGE, overshadowImplementation = true)
public abstract class CodeGenerationResult {

    public abstract List<IGeneratedFile> modelFiles();

    public abstract List<IGeneratedFile> clientFiles();

    public abstract List<IGeneratedFile> serverFiles();

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
                + "    implementation 'javax.ws.rs:javax.ws.rs-api:2.1.1'\n"
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
                + "    api 'io.github.fern-api:auth-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:exception-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:immutables-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:jackson-utils:" + pluginConfig.version() + "'\n"
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

    public static String getServerBuildGradle(FernPluginConfig pluginConfig) {

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
                + "    api 'io.github.fern-api:auth-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:exception-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:immutables-utils:" + pluginConfig.version() + "'\n"
                + "    api 'io.github.fern-api:jackson-utils:" + pluginConfig.version() + "'\n"
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

    public static String getSettingsDotGradle(FernPluginConfig fernPluginConfig) {
        Mode mode = fernPluginConfig.customPluginConfig().mode();
        String settingsGradle = "rootProject.name = 'fern-generated-java'\n"
                + "\n"
                + "include '" + fernPluginConfig.getModelProjectName() + "'\n";

        if (mode.equals(Mode.CLIENT_AND_SERVER) || mode.equals(Mode.CLIENT)) {
            settingsGradle += "include '" + fernPluginConfig.getClientProjectName() + "'\n";
        }
        if (mode.equals(Mode.CLIENT_AND_SERVER) || mode.equals(Mode.SERVER)) {
            settingsGradle += "include '" + fernPluginConfig.getServerProjectName() + "'\n";
        }
        return settingsGradle;
    }

    public static String getBuildDotGradle(String orgName, GeneratorPublishConfig publishConfig) {
        MavenRegistryConfig mavenRegistryConfig = publishConfig.registries().maven();
        String coordinate = "com." + orgName + ".fern";
        return "plugins {\n"
                + "    id 'maven-publish'\n"
                + "}\n"
                + "\n"
                + "subprojects {\n"
                + "\n"
                + "    group '" + coordinate + "'\n"
                + "    version '" + publishConfig.version() + "'\n"
                + "\n"
                + "    apply plugin: \"maven-publish\"\n"
                + "    apply plugin: \"java-library\"\n"
                + "\n"
                + "    publishing {\n"
                + "        publications {\n"
                + "            mavenJava(MavenPublication) {\n"
                + "                from components.java\n"
                + "            }\n"
                + "        }\n"
                + "        repositories {\n"
                + "            maven {\n"
                + "                url '" + mavenRegistryConfig.registryUrl() + "'\n"
                + "                credentials {\n"
                + "                    username '" + mavenRegistryConfig.username() + "'\n"
                + "                    password '" + mavenRegistryConfig.password() + "'\n"
                + "                }\n"
                + "            }\n"
                + "        }\n"
                + "    }\n"
                + "}\n"
                + "\n";
    }

    static ImmutableCodeGenerationResult.Builder builder() {
        return ImmutableCodeGenerationResult.builder();
    }
}
