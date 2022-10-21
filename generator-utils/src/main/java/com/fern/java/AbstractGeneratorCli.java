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
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.MavenCoordinateParser.MavenArtifactAndGroup;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.jackson.ClientObjectMappers;
import com.fern.java.output.AbstractGeneratedFileOutput;
import com.squareup.javapoet.JavaFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import org.immutables.value.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class AbstractGeneratorCli {

    private static final Logger log = LoggerFactory.getLogger(AbstractGeneratorCli.class);

    private static final String SRC_MAIN_JAVA = "src/main/java";
    private static final String BUILD_GRADLE = "build.gradle";
    private static final String SETTINGS_GRADLE = "settings.gradle";
    private static final String GITIGNORE = ".gitignore";

    private final List<AbstractGeneratedFileOutput> generatedFiles = new ArrayList<>();

    private Path outputDirectory = null;

    @SuppressWarnings("checkstyle:VisibilityModifier")
    protected final Consumer<AbstractGeneratedFileOutput> addGeneratedFile;

    protected AbstractGeneratorCli() {
        this.addGeneratedFile = generatedFiles::add;
    }

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
                    runInPublishMode(generatorExecClient, generatorConfig, ir, value);
                    return null;
                }

                @Override
                public Void visitDownloadFiles() {
                    runInDownloadFilesMode(generatorExecClient, generatorConfig, ir);
                    return null;
                }

                @Override
                public Void visitGithub(GithubOutputMode value) {
                    runInGithubMode(generatorExecClient, generatorConfig, ir, value);
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

    public final void runInDownloadFilesMode(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir) {
        runInDownloadFilesModeHook(generatorExecClient, generatorConfig, ir);
        generatedFiles.forEach(generatedFileOutput ->
                writeFile(outputDirectory.resolve(SRC_MAIN_JAVA), generatedFileOutput.javaFile()));
    }

    public abstract void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir);

    public final void runInGithubMode(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            GithubOutputMode githubOutputMode) {
        MavenGithubPublishInfo mavenGithubPublishInfo = githubOutputMode
                .getPublishInfo()
                .getMaven()
                .orElseThrow(() -> new RuntimeException("Expected maven publish info, but received other!"));
        MavenArtifactAndGroup mavenArtifactAndGroup =
                MavenCoordinateParser.parse(mavenGithubPublishInfo.getCoordinate());

        runInGithubModeHook(generatorExecClient, generatorConfig, ir, githubOutputMode);

        // write all files
        BuildGradleConfig buildGradleConfig = BuildGradleConfig.builder()
                .addAllDependencies(getBuildGradleDependencies())
                .publishing(ImmutablePublishingConfig.builder()
                        .version(githubOutputMode.getVersion())
                        .group(mavenArtifactAndGroup.group())
                        .artifact(mavenArtifactAndGroup.artifact())
                        .build())
                .build();
        writeFileContents(outputDirectory.resolve(BUILD_GRADLE), buildGradleConfig.getFileContents());
        writeFileContents(outputDirectory.resolve(SETTINGS_GRADLE), "");
        writeFileContents(outputDirectory.resolve(GITIGNORE), GitIgnoreGenerator.getGitignore());
        generatedFiles.forEach(generatedFileOutput ->
                writeFile(outputDirectory.resolve(SRC_MAIN_JAVA), generatedFileOutput.javaFile()));
        runCommandBlocking(new String[] {"gradle", "wrapper"}, outputDirectory, Collections.emptyMap());
    }

    public abstract void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            GithubOutputMode githubOutputMode);

    public final void runInPublishMode(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
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

        runInPublishModeHook(generatorExecClient, generatorConfig, ir, publishOutputMode);

        // write all files
        BuildGradleConfig buildGradleConfig = BuildGradleConfig.builder()
                .addAllDependencies(getBuildGradleDependencies())
                .publishing(ImmutablePublishingConfig.builder()
                        .version(mavenCoordinate.getVersion())
                        .group(mavenCoordinate.getGroup())
                        .artifact(mavenCoordinate.getArtifact())
                        .build())
                .build();
        writeFileContents(outputDirectory.resolve(BUILD_GRADLE), buildGradleConfig.getFileContents());
        writeFileContents(outputDirectory.resolve(SETTINGS_GRADLE), "");
        writeFileContents(outputDirectory.resolve(GITIGNORE), GitIgnoreGenerator.getGitignore());
        generatedFiles.forEach(generatedFileOutput ->
                writeFile(outputDirectory.resolve(SRC_MAIN_JAVA), generatedFileOutput.javaFile()));
        runCommandBlocking(new String[] {"gradle", "wrapper"}, outputDirectory, Collections.emptyMap());

        // run publish
        if (!generatorConfig.getDryRun()) {
            runCommandBlocking(
                    new String[] {"gradle", "publish"},
                    Paths.get(generatorConfig.getOutput().getPath()),
                    Map.of(
                            BuildGradleConfig.MAVEN_USERNAME_ENV_VAR,
                            mavenRegistryConfigV2.getUsername(),
                            BuildGradleConfig.MAVEN_PASSWORD_ENV_VAR,
                            mavenRegistryConfigV2.getPassword(),
                            BuildGradleConfig.MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR,
                            mavenRegistryConfigV2.getRegistryUrl()));
        }
        generatorExecClient.sendUpdate(GeneratorUpdate.published(PackageCoordinate.maven(mavenCoordinate)));
    }

    public abstract void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            GeneratorPublishConfig publishOutputMode);

    public abstract List<String> getBuildGradleDependencies();

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface MavenPackageCoordinate {
        PackageCoordinate packageCoordinate();

        MavenRegistryConfigV2 mavenRegistryConfig();

        static ImmutableMavenPackageCoordinate.PackageCoordinateBuildStage builder() {
            return ImmutableMavenPackageCoordinate.builder();
        }
    }

    private static GeneratorConfig getGeneratorConfig(String pluginPath) {
        try {
            return ClientObjectMappers.JSON_MAPPER.readValue(new File(pluginPath), GeneratorConfig.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read plugin configuration", e);
        }
    }

    private static IntermediateRepresentation getIr(GeneratorConfig generatorConfig) {
        try {
            return ClientObjectMappers.JSON_MAPPER.readValue(
                    new File(generatorConfig.getIrFilepath()), IntermediateRepresentation.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ir", e);
        }
    }

    private static void writeFile(Path path, JavaFile javaFile) {
        try {
            javaFile.writeToFile(path.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to write generated java file: " + javaFile.typeSpec.name, e);
        }
    }

    private static void writeFileContents(Path path, String contents) {
        try {
            Files.writeString(path, contents);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write .gitignore ", e);
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
