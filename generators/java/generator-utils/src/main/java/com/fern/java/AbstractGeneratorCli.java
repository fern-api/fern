package com.fern.java;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.generator.exec.model.config.MavenCentralSignature;
import com.fern.generator.exec.model.config.MavenGithubPublishInfo;
import com.fern.generator.exec.model.config.MavenRegistryConfigV2;
import com.fern.generator.exec.model.logging.ErrorExitStatusUpdate;
import com.fern.generator.exec.model.logging.ExitStatusUpdate;
import com.fern.generator.exec.model.logging.GeneratorUpdate;
import com.fern.generator.exec.model.logging.MavenCoordinate;
import com.fern.generator.exec.model.logging.PackageCoordinate;
import com.fern.generator.exec.model.logging.SuccessfulStatusUpdate;
import com.fern.ir.core.ObjectMappers;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.publish.DirectPublish;
import com.fern.ir.model.publish.Filesystem;
import com.fern.ir.model.publish.GithubPublish;
import com.fern.java.MavenCoordinateParser.MavenArtifactAndGroup;
import com.fern.java.generators.GithubWorkflowGenerator;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.GeneratedBuildGradle;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedGradleProperties;
import com.fern.java.output.GeneratedPublishScript;
import com.fern.java.output.ImmutableGeneratedBuildGradle;
import com.fern.java.output.RawGeneratedFile;
import com.fern.java.output.gradle.AbstractGradleDependency;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.immutables.value.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class AbstractGeneratorCli<T extends ICustomConfig, K extends IDownloadFilesCustomConfig> {

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface MavenPackageCoordinate {
        static ImmutableMavenPackageCoordinate.PackageCoordinateBuildStage builder() {
            return ImmutableMavenPackageCoordinate.builder();
        }

        PackageCoordinate packageCoordinate();

        MavenRegistryConfigV2 mavenRegistryConfig();
    }

    private static final Logger log = LoggerFactory.getLogger(AbstractGeneratorCli.class);

    private static GeneratorConfig getGeneratorConfig(String pluginPath) {
        try {
            return ObjectMappers.JSON_MAPPER.readValue(new File(pluginPath), GeneratorConfig.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read plugin configuration", e);
        }
    }

    private static IntermediateRepresentation getIr(GeneratorConfig generatorConfig) {
        try {
            File irFile = new File(generatorConfig.getIrFilepath());

            // Read the IR JSON as a string first
            String irJson = java.nio.file.Files.readString(irFile.toPath());

            // Preprocess the JSON to handle integer overflow in examples
            String processedJson = preprocessIntegerOverflow(irJson);

            // Now deserialize with the standard ObjectMapper
            return ObjectMappers.JSON_MAPPER.readValue(processedJson, IntermediateRepresentation.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ir", e);
        }
    }

    /**
     * Preprocesses the IR JSON to handle integer overflow in example values.
     * 
     * OpenAPI specifications may contain example values that exceed Java's Integer
     * limits (e.g., from systems using 64-bit integers). This method finds such
     * values in fields explicitly typed as "integer" and converts them to "long"
     * type to preserve the original value while preventing Jackson deserialization
     * failures.
     * 
     * Note: This only processes integer fields in the IR's example values to avoid
     * modifying actual schema definitions.
     */
    private static String preprocessIntegerOverflow(String json) {
        // Pattern to match "integer": large_number_value patterns
        String integerPattern = "(?<!\")(\"integer\"\\s*:\\s*)(-?\\d{10,})(?!\\d)";
        
        // Pattern to match long values that might be strings when they should be numbers 
        String longStringPattern = "(?<!\")(\"long\"\\s*:\\s*)\"(-?\\d+)\"";

        java.util.regex.Pattern intPattern = java.util.regex.Pattern.compile(integerPattern);
        java.util.regex.Pattern longPattern = java.util.regex.Pattern.compile(longStringPattern);
        
        StringBuffer sb = new StringBuffer();
        int modifications = 0;

        // First pass: convert integer overflow to long
        java.util.regex.Matcher intMatcher = intPattern.matcher(json);
        while (intMatcher.find()) {
            String numberStr = intMatcher.group(2);
            try {
                long value = Long.parseLong(numberStr);

                if (value > Integer.MAX_VALUE || value < Integer.MIN_VALUE) {
                    // Convert to "long" field to preserve the original value
                    log.info("Integer overflow detected in IR example value: {}. Converting to long type to preserve value.", value);
                    intMatcher.appendReplacement(sb, "\"long\": " + value);
                    modifications++;
                } else {
                    intMatcher.appendReplacement(sb, intMatcher.group(0));
                }
            } catch (NumberFormatException e) {
                log.warn("Failed to parse potential integer value: '{}'. Preserving original.", numberStr);
                intMatcher.appendReplacement(sb, intMatcher.group(0));
            }
        }
        intMatcher.appendTail(sb);

        // Second pass: fix any long values that are incorrectly quoted as strings
        String firstPassResult = sb.toString();
        sb = new StringBuffer();
        java.util.regex.Matcher longMatcher = longPattern.matcher(firstPassResult);
        while (longMatcher.find()) {
            String numberStr = longMatcher.group(2);
            try {
                Long.parseLong(numberStr); // Validate it's a valid long
                log.debug("Converting quoted long value to unquoted: {}", numberStr);
                longMatcher.appendReplacement(sb, "\"long\": " + numberStr);
            } catch (NumberFormatException e) {
                longMatcher.appendReplacement(sb, longMatcher.group(0));
            }
        }
        longMatcher.appendTail(sb);

        // Third pass: Handle cases where large integers become string values in the JSON
        // This can happen when Jackson initially serializes large integers as strings
        String secondPassResult = sb.toString();
        sb = new StringBuffer();
        
        // Pattern to match any numeric value that should be unquoted but is quoted
        // This handles cases where our conversion created quoted numbers
        String quotedNumberPattern = "(?<!\")(\\\"(-?\\d{10,})\\\")(?!\\w)";
        java.util.regex.Pattern quotedPattern = java.util.regex.Pattern.compile(quotedNumberPattern);
        java.util.regex.Matcher quotedMatcher = quotedPattern.matcher(secondPassResult);
        
        while (quotedMatcher.find()) {
            String numberStr = quotedMatcher.group(2);
            try {
                Long.parseLong(numberStr); // Validate it's a valid long
                log.debug("Removing quotes from large number: {}", numberStr);
                quotedMatcher.appendReplacement(sb, numberStr);
            } catch (NumberFormatException e) {
                quotedMatcher.appendReplacement(sb, quotedMatcher.group(0));
            }
        }
        quotedMatcher.appendTail(sb);

        if (modifications > 0) {
            log.info("Converted {} integer overflow value(s) to long type in IR", modifications);
        }

        return sb.toString();
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

    private final List<GeneratedFile> generatedFiles = new ArrayList<>();

    private Path outputDirectory = null;

    protected AbstractGeneratorCli() {
    }

    public final void run(String... args) {
        String pluginPath = args[0];
        GeneratorConfig generatorConfig = getGeneratorConfig(pluginPath);
        DefaultGeneratorExecClient generatorExecClient = new DefaultGeneratorExecClient(generatorConfig);
        try {
            IntermediateRepresentation ir = getIr(generatorConfig);
            this.outputDirectory = Paths.get(generatorConfig.getOutput().getPath());
            generatorConfig
                    .getOutput()
                    .getMode()
                    .visit(new com.fern.generator.exec.model.config.OutputMode.Visitor<Void>() {

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
            runV2Generator(generatorExecClient, args);
            generatorExecClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.successful(SuccessfulStatusUpdate.builder().build())));
        } catch (Exception e) {
            log.error("Encountered fatal error", e);
            generatorExecClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.error(
                    ErrorExitStatusUpdate.builder().message(e.getMessage()).build())));
            throw new RuntimeException(e);
        }
    }

    public abstract void runV2Generator(DefaultGeneratorExecClient defaultGeneratorExecClient, String[] args);

    public final void runInDownloadFilesMode(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            K customConfig) {
        runInDownloadFilesModeHook(generatorExecClient, generatorConfig, ir, customConfig);
        Boolean generateFullProject = ir.getPublishConfig()
                .map(publishConfig -> publishConfig
                        .visit(new com.fern.ir.model.publish.PublishingConfig.Visitor<Boolean>() {
                            @Override
                            public Boolean visitDirect(DirectPublish value) {
                                return false;
                            }

                            @Override
                            public Boolean visitGithub(GithubPublish value) {
                                return false;
                            }

                            @Override
                            public Boolean visitFilesystem(Filesystem value) {
                                return value.getGenerateFullProject();
                            }

                            @Override
                            public Boolean _visitUnknown(Object value) {
                                throw new RuntimeException("Encountered unknown publish config: " + value);
                            }
                        }))
                .orElse(false);
        if (generateFullProject) {
            addRootProjectFiles(Optional.empty(), true, false, generatorConfig);
        }
        generatedFiles.forEach(
                generatedFile -> generatedFile.write(outputDirectory, true, customConfig.packagePrefix()));
        if (generateFullProject) {
            runCommandBlocking(new String[] { "gradle", "wrapper" }, outputDirectory, Collections.emptyMap());
            runCommandBlocking(new String[] { "gradle", "spotlessApply" }, outputDirectory, Collections.emptyMap());
        }
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
                    MavenArtifactAndGroup mavenArtifactAndGroup = MavenCoordinateParser
                            .parse(mavenGithubPublishInfo.getCoordinate());
                    return MavenCoordinate.builder()
                            .group(mavenArtifactAndGroup.group())
                            .artifact(mavenArtifactAndGroup.artifact())
                            .version(githubOutputMode.getVersion())
                            .build();
                }));
        runInGithubModeHook(generatorExecClient, generatorConfig, ir, customConfig, githubOutputMode);

        Optional<MavenGithubPublishInfo> mavenGithubPublishInfo = githubOutputMode.getPublishInfo()
                .flatMap(githubPublishInfo -> githubPublishInfo.getMaven());
        Boolean addSignatureBlock = (mavenGithubPublishInfo.isPresent()
                && mavenGithubPublishInfo.get().getSignature().isPresent())
                || customConfigPublishToCentral(generatorConfig);
        // add project level files
        addRootProjectFiles(maybeMavenCoordinate, true, addSignatureBlock, generatorConfig);
        addGeneratedFile(GithubWorkflowGenerator.getGithubWorkflow(
                mavenGithubPublishInfo.map(MavenGithubPublishInfo::getRegistryUrl),
                mavenGithubPublishInfo.flatMap(MavenGithubPublishInfo::getSignature)));
        // write files to disk
        generatedFiles.forEach(generatedFile -> generatedFile.write(outputDirectory, false, Optional.empty()));
        runCommandBlocking(new String[] { "gradle", "wrapper" }, outputDirectory, Collections.emptyMap());
        runCommandBlocking(new String[] { "gradle", "spotlessApply" }, outputDirectory, Collections.emptyMap());
    }

    public boolean customConfigPublishToCentral(GeneratorConfig _generatorConfig) {
        return false;
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
        MavenRegistryConfigV2 mavenRegistryConfigV2 = publishOutputMode.getRegistriesV2().getMaven();
        MavenArtifactAndGroup mavenArtifactAndGroup = MavenCoordinateParser
                .parse(mavenRegistryConfigV2.getCoordinate());
        MavenCoordinate mavenCoordinate = MavenCoordinate.builder()
                .group(mavenArtifactAndGroup.group())
                .artifact(mavenArtifactAndGroup.artifact())
                .version(publishOutputMode.getVersion())
                .build();
        generatorExecClient.sendUpdate(GeneratorUpdate.publishing(PackageCoordinate.maven(mavenCoordinate)));

        runInPublishModeHook(generatorExecClient, generatorConfig, ir, customConfig, publishOutputMode);

        Boolean addSignatureBlock = mavenRegistryConfigV2.getSignature().isPresent();
        addRootProjectFiles(
                Optional.of(mavenCoordinate),
                false,
                mavenRegistryConfigV2.getSignature().isPresent(),
                generatorConfig);

        generatedFiles.forEach(generatedFile -> generatedFile.write(outputDirectory, false, Optional.empty()));
        runCommandBlocking(new String[] { "gradle", "wrapper" }, outputDirectory, Collections.emptyMap());
        runCommandBlocking(new String[] { "gradle", "spotlessApply" }, outputDirectory, Collections.emptyMap());

        // run publish
        if (!generatorConfig.getDryRun()) {
            HashMap<String, String> publishEnvVars = new HashMap<>(Map.of(
                    GeneratedBuildGradle.MAVEN_USERNAME_ENV_VAR,
                    mavenRegistryConfigV2.getUsername(),
                    GeneratedBuildGradle.MAVEN_PASSWORD_ENV_VAR,
                    mavenRegistryConfigV2.getPassword(),
                    GeneratedBuildGradle.MAVEN_PUBLISH_REGISTRY_URL_ENV_VAR,
                    mavenRegistryConfigV2.getRegistryUrl()));
            if (addSignatureBlock) {
                MavenCentralSignature signature = mavenRegistryConfigV2.getSignature().get();
                publishEnvVars.put(GeneratedBuildGradle.MAVEN_SIGNING_KEY_ID, signature.getKeyId());
                publishEnvVars.put(GeneratedBuildGradle.MAVEN_SIGNING_PASSWORD, signature.getPassword());
                publishEnvVars.put(GeneratedBuildGradle.MAVEN_SIGNING_KEY, signature.getSecretKey());
                runCommandBlocking(
                        new String[] { "./.publish/prepare.sh" },
                        Paths.get(generatorConfig.getOutput().getPath()),
                        publishEnvVars);
            }
            runCommandBlocking(
                    new String[] { "gradle", "publish" },
                    Paths.get(generatorConfig.getOutput().getPath()),
                    publishEnvVars);
        }
        generatorExecClient.sendUpdate(GeneratorUpdate.published(PackageCoordinate.maven(mavenCoordinate)));
    }

    public abstract void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            T customConfig,
            GeneratorPublishConfig publishOutputMode);

    public abstract List<AbstractGradleDependency> getBuildGradleDependencies();

    public abstract List<String> getSubProjects();

    public abstract <T extends ICustomConfig> T getCustomConfig(GeneratorConfig generatorConfig);

    public abstract <K extends IDownloadFilesCustomConfig> K getDownloadFilesCustomConfig(
            GeneratorConfig generatorConfig);

    protected final void addGeneratedFile(GeneratedFile generatedFile) {
        generatedFiles.add(generatedFile);
    }

    private void addRootProjectFiles(
            Optional<MavenCoordinate> maybeMavenCoordinate,
            boolean addTestBlock,
            boolean addSignaturePlugin,
            GeneratorConfig generatorConfig) {
        String repositoryUrl = addSignaturePlugin
                ? "https://oss.sonatype.org/service/local/staging/deploy/maven2/"
                : "https://s01.oss.sonatype.org/content/repositories/releases/";

        ImmutableGeneratedBuildGradle.Builder buildGradle = GeneratedBuildGradle.builder()
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
                .addCustomRepositories(
                        GradleRepository.builder().url(repositoryUrl).build())
                .gradlePublishingConfig(maybeMavenCoordinate.map(mavenCoordinate -> GradlePublishingConfig.builder()
                        .version(mavenCoordinate.getVersion())
                        .group(mavenCoordinate.getGroup())
                        .artifact(mavenCoordinate.getArtifact())
                        .build()))
                .generatorConfig(generatorConfig)
                .shouldSignPackage(addSignaturePlugin)
                .addAllDependencies(getBuildGradleDependencies())
                .addCustomBlocks("tasks.withType(Javadoc) {\n" + "    failOnError false\n"
                        + "    options.addStringOption('Xdoclint:none', '-quiet')\n"
                        + "}")
                .addCustomBlocks("spotless {\n" + "    java {\n" + "        palantirJavaFormat()\n" + "    }\n" + "}\n")
                .addCustomBlocks("java {\n" + "    withSourcesJar()\n" + "    withJavadocJar()\n" + "}\n");
        if (maybeMavenCoordinate.isPresent()) {
            buildGradle.addCustomBlocks("group = '" + maybeMavenCoordinate.get().getGroup() + "'");
            buildGradle.addCustomBlocks(
                    "version = '" + maybeMavenCoordinate.get().getVersion() + "'");

            buildGradle.addCustomBlocks("jar {\n" + "    dependsOn(\":generatePomFileForMavenPublication\")\n"
                    + "    archiveBaseName = \""
                    + maybeMavenCoordinate.get().getArtifact() + "\"\n" + "}");
            buildGradle.addCustomBlocks("sourcesJar {\n" + "    archiveBaseName = \""
                    + maybeMavenCoordinate.get().getArtifact() + "\"\n" + "}");
            buildGradle.addCustomBlocks("javadocJar {\n" + "    archiveBaseName = \""
                    + maybeMavenCoordinate.get().getArtifact() + "\"\n" + "}");
        }
        if (addSignaturePlugin) {
            buildGradle.addPlugins(GradlePlugin.builder().pluginId("signing").build());
            buildGradle.addPlugins(GradlePlugin.builder()
                    .pluginId("cl.franciscosolis.sonatype-central-upload")
                    .version("1.0.3")
                    .build());
            buildGradle.addCustomBlocks("signing {\n" + "    sign(publishing.publications)\n" + "}");
            // Generate an empty gradle.properties file
            addGeneratedFile(GeneratedGradleProperties.getGeneratedFile());
            // Generate script to populate that file
            addGeneratedFile(new GeneratedPublishScript());
        }
        if (addTestBlock) {
            buildGradle.addCustomBlocks("test {\n"
                    + "    useJUnitPlatform()\n"
                    + "    testLogging {\n"
                    + "        showStandardStreams = true\n"
                    + "    }\n"
                    + "}");
        }

        addGeneratedFile(buildGradle.build());
        String settingsGradleContents = "";
        if (maybeMavenCoordinate.isPresent()) {
            settingsGradleContents += "rootProject.name = '" + maybeMavenCoordinate.get().getArtifact() + "'\n\n";
        }
        settingsGradleContents += getSubProjects().stream()
                .map(project -> "include '" + project + "'")
                .collect(Collectors.joining("\n"));

        addGeneratedFile(RawGeneratedFile.builder()
                .filename("settings.gradle")
                .contents(settingsGradleContents)
                .build());
        addGeneratedFile(GitIgnoreGenerator.getGitignore());
    }
}
