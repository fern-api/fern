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

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.generator.exec.model.config.MavenGithubPublishInfo;
import com.fern.generator.exec.model.config.MavenRegistryConfigV2;
import com.fern.generator.exec.model.config.OutputMode.Visitor;
import com.fern.generator.exec.model.logging.ErrorExitStatusUpdate;
import com.fern.generator.exec.model.logging.ExitStatusUpdate;
import com.fern.generator.exec.model.logging.GeneratorUpdate;
import com.fern.generator.exec.model.logging.MavenCoordinate;
import com.fern.generator.exec.model.logging.PackageCoordinate;
import com.fern.ir.v12.model.ir.IntermediateRepresentation;
import com.fern.java.MavenCoordinateParser.MavenArtifactAndGroup;
import com.fern.java.generators.GithubWorkflowGenerator;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.jackson.ClientObjectMappers;
import com.fern.java.output.GeneratedBuildGradle;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.RawGeneratedFile;
import com.fern.java.output.gradle.GradleDependency;
import com.fern.java.output.gradle.GradlePlugin;
import com.fern.java.output.gradle.GradlePublishingConfig;
import com.fern.java.output.gradle.GradleRepository;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.immutables.value.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class AbstractGeneratorCli<T extends CustomConfig, K extends DownloadFilesCustomConfig> {

    private static final Logger log = LoggerFactory.getLogger(AbstractGeneratorCli.class);

    private final List<GeneratedFile> generatedFiles = new ArrayList<>();

    private Path outputDirectory = null;

    protected AbstractGeneratorCli() {}

    public final void run(String... args) {
        String pluginPath = args[0];
        GeneratorConfig generatorConfig = getGeneratorConfig(pluginPath);
        DefaultGeneratorExecClient generatorExecClient = new DefaultGeneratorExecClient(generatorConfig);
        try {
            IntermediateRepresentation ir = getIr(generatorConfig);
            this.outputDirectory = Paths.get(generatorConfig.getOutput().getPath());
            generatorConfig.getOutput().getMode().visit(new Visitor<Void>() {

                @Override
                public Void visitPublish(GeneratorPublishConfig value) {
                    T customConfig = getCustomConfig(generatorConfig);
                    runInPublishMode(generatorExecClient, generatorConfig, ir, customConfig, value);
                    return null;
                }

                @Override
                public Void visitDownloadFiles() {
                    K customConfig = getDownloadFilesCustomConfig(generatorConfig);
                    runInDownloadFilesMode(generatorExecClient, generatorConfig, ir, customConfig);
                    return null;
                }

                @Override
                public Void visitGithub(GithubOutputMode value) {
                    T customConfig = getCustomConfig(generatorConfig);
                    runInGithubMode(generatorExecClient, generatorConfig, ir, customConfig, value);
                    return null;
                }

                @Override
                public Void visitUnknown(String unknownType) {
                    throw new RuntimeException("Encountered unknown output mode: " + unknownType);
                }
            });
            generatorExecClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
        } catch (Exception e) {
            log.error("Encountered fatal error", e);
            generatorExecClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.error(
                    ErrorExitStatusUpdate.builder().message(e.getMessage()).build())));
            throw new RuntimeException(e);
        }
    }

    protected final void addGeneratedFile(GeneratedFile generatedFile) {
        generatedFiles.add(generatedFile);
    }

    public final void runInDownloadFilesMode(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            K customConfig) {
        runInDownloadFilesModeHook(generatorExecClient, generatorConfig, ir, customConfig);
        generatedFiles.forEach(
                generatedFile -> generatedFile.write(outputDirectory, true, customConfig.packagePrefix()));
    }

    public abstract void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            K customConfig);

    public final void runInGithubMode(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            T customConfig,
            GithubOutputMode githubOutputMode) {
        Optional<MavenCoordinate> maybeMavenCoordinate = githubOutputMode
                .getPublishInfo()
                .flatMap(githubPublishInfo -> githubPublishInfo.getMaven().map(mavenGithubPublishInfo -> {
                    MavenArtifactAndGroup mavenArtifactAndGroup =
                            MavenCoordinateParser.parse(mavenGithubPublishInfo.getCoordinate());
                    return MavenCoordinate.builder()
                            .group(mavenArtifactAndGroup.group())
                            .artifact(mavenArtifactAndGroup.artifact())
                            .version(githubOutputMode.getVersion())
                            .build();
                }));
        runInGithubModeHook(generatorExecClient, generatorConfig, ir, customConfig, githubOutputMode);

        // add project level files
        addRootProjectFiles(maybeMavenCoordinate);
        addGeneratedFile(GithubWorkflowGenerator.getGithubWorkflow(
                githubOutputMode.getPublishInfo().flatMap(githubPublishInfo -> githubPublishInfo
                        .getMaven()
                        .map(MavenGithubPublishInfo::getRegistryUrl))));

        // write files to disk
        generatedFiles.forEach(generatedFile -> generatedFile.write(outputDirectory, false, Optional.empty()));

        runCommandBlocking(new String[] {"gradle", "wrapper"}, outputDirectory, Collections.emptyMap());
    }

    public abstract void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            T customConfig,
            GithubOutputMode githubOutputMode);

    public final void runInPublishMode(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            T customConfig,
            GeneratorPublishConfig publishOutputMode) {
        // send publishing update
        MavenRegistryConfigV2 mavenRegistryConfigV2 =
                publishOutputMode.getRegistriesV2().getMaven();
        MavenArtifactAndGroup mavenArtifactAndGroup =
                MavenCoordinateParser.parse(mavenRegistryConfigV2.getCoordinate());
        MavenCoordinate mavenCoordinate = MavenCoordinate.builder()
                .group(mavenArtifactAndGroup.group())
                .artifact(mavenArtifactAndGroup.artifact())
                .version(publishOutputMode.getVersion())
                .build();
        generatorExecClient.sendUpdate(GeneratorUpdate.publishing(PackageCoordinate.maven(mavenCoordinate)));

        runInPublishModeHook(generatorExecClient, generatorConfig, ir, customConfig, publishOutputMode);

        addRootProjectFiles(Optional.of(mavenCoordinate));

        generatedFiles.forEach(generatedFile -> generatedFile.write(outputDirectory, false, Optional.empty()));
        runCommandBlocking(new String[] {"gradle", "wrapper"}, outputDirectory, Collections.emptyMap());
        runCommandBlocking(new String[] {"gradle", "spotlessApply"}, outputDirectory, Collections.emptyMap());

        // run publish
        if (!generatorConfig.getDryRun()) {
            runCommandBlocking(
                    new String[] {"gradle", "publish"},
                    Paths.get(generatorConfig.getOutput().getPath()),
                    Map.of(
                            GeneratedBuildGradle.MAVEN_USERNAME_ENV_VAR,
                            mavenRegistryConfigV2.getUsername(),
                            GeneratedBuildGradle.MAVEN_PASSWORD_ENV_VAR,
                            mavenRegistryConfigV2.getPassword(),
                            GeneratedBuildGradle.MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR,
                            mavenRegistryConfigV2.getRegistryUrl()));
        }
        generatorExecClient.sendUpdate(GeneratorUpdate.published(PackageCoordinate.maven(mavenCoordinate)));
    }

    public abstract void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            T customConfig,
            GeneratorPublishConfig publishOutputMode);

    public abstract List<GradleDependency> getBuildGradleDependencies();

    public abstract List<String> getSubProjects();

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface MavenPackageCoordinate {
        PackageCoordinate packageCoordinate();

        MavenRegistryConfigV2 mavenRegistryConfig();

        static ImmutableMavenPackageCoordinate.PackageCoordinateBuildStage builder() {
            return ImmutableMavenPackageCoordinate.builder();
        }
    }

    private void addRootProjectFiles(Optional<MavenCoordinate> maybeMavenCoordinate) {
        GeneratedBuildGradle buildGradle = GeneratedBuildGradle.builder()
                .addAllPlugins(List.of(
                        GradlePlugin.builder()
                                .pluginId(GeneratedBuildGradle.JAVA_LIBRARY_PLUGIN_ID)
                                .build(),
                        GradlePlugin.builder()
                                .pluginId(GeneratedBuildGradle.MAVEN_PUBLISH_PLUGIN_ID)
                                .build(),
                        GradlePlugin.builder()
                                .pluginId("com.diffplug.spotless")
                                .version("6.11.0")
                                .build()))
                .addCustomRepositories(GradleRepository.builder()
                        .url("https://s01.oss.sonatype.org/content/repositories/releases/")
                        .build())
                .gradlePublishingConfig(maybeMavenCoordinate.map(mavenCoordinate -> GradlePublishingConfig.builder()
                        .version(mavenCoordinate.getVersion())
                        .group(mavenCoordinate.getGroup())
                        .artifact(mavenCoordinate.getArtifact())
                        .build()))
                .addAllDependencies(getBuildGradleDependencies())
                .addCustomBlocks("spotless {\n" + "    java {\n" + "        googleJavaFormat()\n" + "    }\n" + "}\n")
                .addCustomBlocks("java {\n" + "    withSourcesJar()\n" + "    withJavadocJar()\n" + "}\n")
                .build();
        addGeneratedFile(buildGradle);
        addGeneratedFile(RawGeneratedFile.builder()
                .filename("settings.gradle")
                .contents(getSubProjects().stream()
                        .map(project -> "include '" + project + "'")
                        .collect(Collectors.joining("\n")))
                .build());
        addGeneratedFile(GitIgnoreGenerator.getGitignore());
    }

    private static GeneratorConfig getGeneratorConfig(String pluginPath) {
        try {
            return ClientObjectMappers.JSON_MAPPER.readValue(new File(pluginPath), GeneratorConfig.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read plugin configuration", e);
        }
    }

    public abstract <T extends CustomConfig> T getCustomConfig(GeneratorConfig generatorConfig);

    public abstract <K extends DownloadFilesCustomConfig> K getDownloadFilesCustomConfig(
            GeneratorConfig generatorConfig);

    private static IntermediateRepresentation getIr(GeneratorConfig generatorConfig) {
        try {
            return ClientObjectMappers.JSON_MAPPER.readValue(
                    new File(generatorConfig.getIrFilepath()), IntermediateRepresentation.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ir", e);
        }
    }

    private static void runCommandBlocking(String[] command, Path workingDirectory, Map<String, String> environment) {
        try {
            Process process = runCommandAsync(command, workingDirectory, environment);
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Command failed with non-zero exit code: " + Arrays.toString(command));
            }
            process.waitFor();
        } catch (InterruptedException e) {
            throw new RuntimeException("Failed to run command", e);
        }
    }

    private static Process runCommandAsync(String[] command, Path workingDirectory, Map<String, String> environment) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command).directory(workingDirectory.toFile());
            pb.environment().putAll(environment);
            Process process = pb.start();
            StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream());
            StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream());
            errorGobbler.start();
            outputGobbler.start();
            return process;
        } catch (IOException e) {
            throw new RuntimeException("Failed to run command: " + Arrays.toString(command), e);
        }
    }
}
