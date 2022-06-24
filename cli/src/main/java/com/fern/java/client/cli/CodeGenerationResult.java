package com.fern.java.client.cli;

import com.fern.codegen.IGeneratedFile;
import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.java.client.cli.FernPluginConfig.PublishConfig;
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
                + "}\n"
                + "\n"
                + "dependencies {\n"
                + "    implementation 'com.fasterxml.jackson.core:jackson-databind:2.12.3'\n"
                + "    implementation 'com.google.code.findbugs:annotations:3.0.1'\n"
                + "    implementation 'javax.ws.rs:javax.ws.rs-api:2.1.1'\n"
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
                + "}\n"
                + "\n"
                + "dependencies {\n"
                + "    api project(':" + pluginConfig.getModelProjectName() + "')\n"
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
                + "}\n"
                + "\n"
                + "dependencies {\n"
                + "    api project(':" + pluginConfig.getModelProjectName() + "')\n"
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

    public static String getBuildDotGradle(PublishConfig publishConfig) {
        return "plugins {\n"
                + "    id 'maven-publish'\n"
                + "}\n"
                + "\n"
                + "subprojects {\n"
                + "\n"
                + "    group '" + publishConfig.coordinate() + "'\n"
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
                + "                url '" + publishConfig.url() + "'\n"
                + "                credentials {\n"
                + "                    username '" + publishConfig.username() + "'\n"
                + "                    password '" + publishConfig.password() + "'\n"
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
