package com.fern.java;

import static com.fern.java.GeneratorLogging.log;
import static com.fern.java.GeneratorLogging.logError;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.immutables.value.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class AbstractGeneratorCli<T extends ICustomConfig, K extends IDownloadFilesCustomConfig> {

    /**
     * Result object for publish configuration extraction, replacing AtomicReference pattern. This provides a cleaner
     * approach to returning multiple values from the visitor pattern.
     */
    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface PublishConfigResult {
        boolean generateFullProject();

        Optional<MavenCoordinate> mavenCoordinate();

        static ImmutablePublishConfigResult.GenerateFullProjectBuildStage builder() {
            return ImmutablePublishConfigResult.builder();
        }
    }

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

            String irJson = java.nio.file.Files.readString(irFile.toPath());

            String processedJson = preprocessIntegerOverflow(irJson);

            return ObjectMappers.JSON_MAPPER.readValue(processedJson, IntermediateRepresentation.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ir", e);
        }
    }

    /**
     * Preprocesses the IR JSON to handle integer overflow in example values.
     *
     * <p>OpenAPI specifications may contain example values that exceed Java's Integer limits (e.g., from systems using
     * 64-bit integers). This method finds such values in fields explicitly typed as "integer" and converts them to
     * "long" type to preserve the original value while preventing Jackson deserialization failures.
     *
     * <p>Note: This only processes integer fields in the IR's example values to avoid modifying actual schema
     * definitions.
     */
    private static String preprocessIntegerOverflow(String json) {
        if (json == null || json.trim().isEmpty()) {
            return json;
        }

        try {
            return processJsonForIntegerOverflow(json);
        } catch (Exception e) {
            log.warn("Failed to preprocess integer overflow, using original JSON", e);
            return json;
        }
    }

    private static String processJsonForIntegerOverflow(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(json);

        IntegerOverflowProcessor processor = new IntegerOverflowProcessor();
        JsonNode processedNode = processor.processNode(rootNode);

        if (processor.getConversions() > 0) {
            log.info("Converted {} integer overflow value(s) to long type in IR", processor.getConversions());
        }

        return mapper.writeValueAsString(processedNode);
    }

    private static class IntegerOverflowProcessor {
        private int conversions = 0;

        public int getConversions() {
            return conversions;
        }

        public JsonNode processNode(JsonNode node) {
            if (node == null) {
                return node;
            }

            if (node.isObject()) {
                return processObjectNode((ObjectNode) node);
            } else if (node.isArray()) {
                return processArrayNode((ArrayNode) node);
            } else if (node.isNumber()) {
                return processNumberNode(node);
            } else {
                return node;
            }
        }

        private JsonNode processObjectNode(ObjectNode objectNode) {
            ObjectNode result = objectNode.deepCopy();

            if (result.has("integer")) {
                JsonNode integerNode = result.get("integer");
                if (integerNode.isNumber() && isIntegerOverflow(integerNode)) {
                    long value = integerNode.asLong();
                    log.debug("Integer overflow detected in IR example value: {}. Converting to long type.", value);
                    result.remove("integer");
                    result.put("long", value);
                    conversions++;
                }
            }

            java.util.Iterator<java.util.Map.Entry<String, JsonNode>> fields = result.fields();
            while (fields.hasNext()) {
                java.util.Map.Entry<String, JsonNode> field = fields.next();
                String fieldName = field.getKey();
                JsonNode fieldValue = field.getValue();

                if ("integer".equals(fieldName) || "long".equals(fieldName)) {
                    continue;
                }

                JsonNode processedValue = processNode(fieldValue);
                if (processedValue != fieldValue) {
                    result.set(fieldName, processedValue);
                }
            }

            return result;
        }

        private JsonNode processArrayNode(ArrayNode arrayNode) {
            ArrayNode result = arrayNode.deepCopy();

            for (int i = 0; i < result.size(); i++) {
                JsonNode element = result.get(i);
                JsonNode processedElement = processNode(element);
                if (processedElement != element) {
                    result.set(i, processedElement);
                }
            }

            return result;
        }

        private JsonNode processNumberNode(JsonNode numberNode) {
            if (isIntegerOverflow(numberNode)) {
                log.debug("Converting overflow integer {} to long", numberNode.asLong());
                conversions++;
                return JsonNodeFactory.instance.numberNode(numberNode.asLong());
            }
            return numberNode;
        }

        private boolean isIntegerOverflow(JsonNode numberNode) {
            if (!numberNode.isNumber()) {
                return false;
            }

            try {
                if (numberNode.isIntegralNumber()) {
                    long value = numberNode.asLong();
                    return value > Integer.MAX_VALUE || value < Integer.MIN_VALUE;
                }
            } catch (Exception e) {
                log.debug("Failed to check integer overflow for value: {}", numberNode);
            }

            return false;
        }
    }

    private static void runCommandBlocking(String[] command, Path workingDirectory, Map<String, String> environment) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command).directory(workingDirectory.toFile());
            pb.environment().putAll(environment);
            Process process = pb.start();
            StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream());
            StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream());
            errorGobbler.start();
            outputGobbler.start();

            int exitCode = process.waitFor();
            errorGobbler.join();
            outputGobbler.join();

            if (exitCode != 0) {
                List<String> allOutput = new ArrayList<>();
                allOutput.addAll(outputGobbler.getCapturedLines());
                allOutput.addAll(errorGobbler.getCapturedLines());

                int startIndex = Math.max(0, allOutput.size() - 100);
                String outputTail =
                        allOutput.subList(startIndex, allOutput.size()).stream().collect(Collectors.joining("\n"));

                String errorMessage = "Command failed with exit code " + exitCode + ": " + Arrays.toString(command);
                if (!outputTail.isEmpty()) {
                    errorMessage += "\n\nLast " + (allOutput.size() - startIndex) + " lines of output:\n" + outputTail;
                }
                throw new RuntimeException(errorMessage);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to start command: " + Arrays.toString(command), e);
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

    private static void copyGradleWrapperFromResources(Path outputDirectory) {
        try {
            copyResourceFile("gradle-wrapper/gradlew", outputDirectory.resolve("gradlew"), true);
            copyResourceFile("gradle-wrapper/gradlew.bat", outputDirectory.resolve("gradlew.bat"), false);
            Path wrapperDir = outputDirectory.resolve("gradle").resolve("wrapper");
            Files.createDirectories(wrapperDir);
            copyResourceFile(
                    "gradle-wrapper/gradle/wrapper/gradle-wrapper.jar",
                    wrapperDir.resolve("gradle-wrapper.jar"),
                    false);
            copyResourceFile(
                    "gradle-wrapper/gradle/wrapper/gradle-wrapper.properties",
                    wrapperDir.resolve("gradle-wrapper.properties"),
                    false);
        } catch (IOException e) {
            throw new RuntimeException("Failed to copy gradle wrapper from resources", e);
        }
    }

    private static void copyResourceFile(String resourcePath, Path destination, boolean makeExecutable)
            throws IOException {
        try (var inputStream = AbstractGeneratorCli.class.getClassLoader().getResourceAsStream(resourcePath)) {
            if (inputStream == null) {
                throw new IOException("Resource not found: " + resourcePath);
            }
            Files.copy(inputStream, destination, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            if (makeExecutable) {
                destination.toFile().setExecutable(true);
            }
        }
    }

    private final List<GeneratedFile> generatedFiles = new ArrayList<>();

    private Path outputDirectory = null;

    protected AbstractGeneratorCli() {}

    public final void run(String... args) {
        String pluginPath = args[0];
        GeneratorConfig generatorConfig = getGeneratorConfig(pluginPath);
        DefaultGeneratorExecClient generatorExecClient = new DefaultGeneratorExecClient(generatorConfig);
        try {
            log(generatorExecClient, "Starting Java SDK generation");
            IntermediateRepresentation ir = getIr(generatorConfig);
            this.outputDirectory = Paths.get(generatorConfig.getOutput().getPath());
            generatorConfig
                    .getOutput()
                    .getMode()
                    .visit(new com.fern.generator.exec.model.config.OutputMode.Visitor<Void>() {

                        @Override
                        public Void visitPublish(GeneratorPublishConfig value) {
                            log(generatorExecClient, "Generating Java SDK in publish mode");
                            T customConfig = getCustomConfig(generatorConfig);
                            runInPublishMode(generatorExecClient, generatorConfig, ir, customConfig, value);
                            return null;
                        }

                        @Override
                        public Void visitDownloadFiles() {
                            log(generatorExecClient, "Generating Java SDK in download files mode");
                            K customConfig = getDownloadFilesCustomConfig(generatorConfig);
                            runInDownloadFilesMode(generatorExecClient, generatorConfig, ir, customConfig);
                            return null;
                        }

                        @Override
                        public Void visitGithub(GithubOutputMode value) {
                            log(generatorExecClient, "Generating Java SDK in GitHub mode");
                            T customConfig = getCustomConfig(generatorConfig);
                            runInGithubMode(generatorExecClient, generatorConfig, ir, customConfig, value);
                            return null;
                        }

                        @Override
                        public Void visitUnknown(String unknownType) {
                            throw new RuntimeException("Encountered unknown output mode: " + unknownType);
                        }
                    });
            log(generatorExecClient, "Completed Java v1 SDK generation");
            runV2Generator(generatorExecClient, args);
            generatorExecClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.successful(SuccessfulStatusUpdate.builder().build())));
        } catch (Exception e) {
            log.error("Encountered fatal error", e);
            String errorMessage =
                    e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            logError(generatorExecClient, "Java SDK generation failed: " + errorMessage);
            generatorExecClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.error(
                    ErrorExitStatusUpdate.builder().message(errorMessage).build())));
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

        // Extract publish configuration using a cleaner object-based approach
        PublishConfigResult publishResult = ir.getPublishConfig()
                .map(publishConfig -> publishConfig.visit(
                        new com.fern.ir.model.publish.PublishingConfig.Visitor<PublishConfigResult>() {
                            @Override
                            public PublishConfigResult visitDirect(DirectPublish value) {
                                return PublishConfigResult.builder()
                                        .generateFullProject(false)
                                        .mavenCoordinate(Optional.empty())
                                        .build();
                            }

                            @Override
                            public PublishConfigResult visitGithub(GithubPublish value) {
                                return PublishConfigResult.builder()
                                        .generateFullProject(false)
                                        .mavenCoordinate(Optional.empty())
                                        .build();
                            }

                            @Override
                            public PublishConfigResult visitFilesystem(Filesystem value) {
                                Optional<MavenCoordinate> mavenCoordinate = Optional.empty();

                                if (value.getGenerateFullProject()
                                        && value.getPublishTarget().isPresent()) {
                                    com.fern.ir.model.publish.PublishTarget target =
                                            value.getPublishTarget().get();
                                    mavenCoordinate = target.visit(
                                            new com.fern.ir.model.publish.PublishTarget.Visitor<
                                                    Optional<MavenCoordinate>>() {
                                                @Override
                                                public Optional<MavenCoordinate> visitPostman(
                                                        com.fern.ir.model.publish.PostmanPublishTarget value) {
                                                    return Optional.empty();
                                                }

                                                @Override
                                                public Optional<MavenCoordinate> visitNpm(
                                                        com.fern.ir.model.publish.NpmPublishTarget value) {
                                                    return Optional.empty();
                                                }

                                                @Override
                                                public Optional<MavenCoordinate> visitMaven(
                                                        com.fern.ir.model.publish.MavenPublishTarget mavenTarget) {
                                                    if (mavenTarget
                                                            .getCoordinate()
                                                            .isPresent()) {
                                                        String coordinateStr = mavenTarget
                                                                .getCoordinate()
                                                                .get();
                                                        MavenArtifactAndGroup parsed =
                                                                MavenCoordinateParser.parse(coordinateStr);
                                                        MavenCoordinate coord = MavenCoordinate.builder()
                                                                .group(parsed.group())
                                                                .artifact(parsed.artifact())
                                                                .version(mavenTarget
                                                                        .getVersion()
                                                                        .orElse("0.0.0"))
                                                                .build();
                                                        return Optional.of(coord);
                                                    }
                                                    return Optional.empty();
                                                }

                                                @Override
                                                public Optional<MavenCoordinate> visitPypi(
                                                        com.fern.ir.model.publish.PypiPublishTarget value) {
                                                    return Optional.empty();
                                                }

                                                @Override
                                                public Optional<MavenCoordinate> visitCrates(
                                                        com.fern.ir.model.publish.CratesPublishTarget value) {
                                                    return Optional.empty();
                                                }

                                                @Override
                                                public Optional<MavenCoordinate> _visitUnknown(Object value) {
                                                    return Optional.empty();
                                                }
                                            });
                                }

                                return PublishConfigResult.builder()
                                        .generateFullProject(value.getGenerateFullProject())
                                        .mavenCoordinate(mavenCoordinate)
                                        .build();
                            }

                            @Override
                            public PublishConfigResult _visitUnknown(Object value) {
                                throw new RuntimeException("Encountered unknown publish config: " + value);
                            }
                        }))
                .orElse(PublishConfigResult.builder()
                        .generateFullProject(false)
                        .mavenCoordinate(Optional.empty())
                        .build());

        if (publishResult.generateFullProject()) {
            addRootProjectFiles(publishResult.mavenCoordinate(), true, false, generatorConfig);
        }
        generatedFiles.forEach(
                generatedFile -> generatedFile.write(outputDirectory, true, customConfig.packagePrefix()));
        copyLicenseFile(generatorConfig);
        if (publishResult.generateFullProject()) {
            copyGradleWrapperFromResources(outputDirectory);
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
                    MavenArtifactAndGroup mavenArtifactAndGroup =
                            MavenCoordinateParser.parse(mavenGithubPublishInfo.getCoordinate());
                    return MavenCoordinate.builder()
                            .group(mavenArtifactAndGroup.group())
                            .artifact(mavenArtifactAndGroup.artifact())
                            .version(githubOutputMode.getVersion())
                            .build();
                }));
        runInGithubModeHook(generatorExecClient, generatorConfig, ir, customConfig, githubOutputMode);

        Optional<MavenGithubPublishInfo> mavenGithubPublishInfo =
                githubOutputMode.getPublishInfo().flatMap(githubPublishInfo -> githubPublishInfo.getMaven());
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
        copyLicenseFile(generatorConfig);
        copyGradleWrapperFromResources(outputDirectory);
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

        Boolean addSignatureBlock = mavenRegistryConfigV2.getSignature().isPresent();
        addRootProjectFiles(
                Optional.of(mavenCoordinate),
                false,
                mavenRegistryConfigV2.getSignature().isPresent(),
                generatorConfig);

        generatedFiles.forEach(generatedFile -> generatedFile.write(outputDirectory, false, Optional.empty()));
        copyLicenseFile(generatorConfig);
        copyGradleWrapperFromResources(outputDirectory);

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
                MavenCentralSignature signature =
                        mavenRegistryConfigV2.getSignature().get();
                publishEnvVars.put(GeneratedBuildGradle.MAVEN_SIGNING_KEY_ID, signature.getKeyId());
                publishEnvVars.put(GeneratedBuildGradle.MAVEN_SIGNING_PASSWORD, signature.getPassword());
                publishEnvVars.put(GeneratedBuildGradle.MAVEN_SIGNING_KEY, signature.getSecretKey());
                runCommandBlocking(
                        new String[] {"./.publish/prepare.sh"},
                        Paths.get(generatorConfig.getOutput().getPath()),
                        publishEnvVars);
            }
            runCommandBlocking(
                    new String[] {"chmod", "+x", "gradlew"},
                    Paths.get(generatorConfig.getOutput().getPath()),
                    publishEnvVars);
            runCommandBlocking(
                    new String[] {"./gradlew", "publish", "--stacktrace", "--info", "--console=plain", "--no-daemon"},
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

    public List<String> getAdditionalBuildGradleBlocks() {
        return List.of();
    }

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
                .addCustomBlocks("java {\n" + "    withSourcesJar()\n" + "    withJavadocJar()\n" + "}\n")
                .addAllCustomBlocks(getAdditionalBuildGradleBlocks());
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
            settingsGradleContents +=
                    "rootProject.name = '" + maybeMavenCoordinate.get().getArtifact() + "'\n\n";
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

    /**
     * Copy LICENSE file from Docker mount location to project root. For local generation, the CLI mounts the license
     * file at /tmp/LICENSE. For remote generation (Fiddle), the license file is handled separately.
     */
    private void copyLicenseFile(GeneratorConfig generatorConfig) {
        if (!generatorConfig.getLicense().isPresent()) {
            return;
        }

        generatorConfig
                .getLicense()
                .get()
                .visit(new com.fern.generator.exec.model.config.LicenseConfig.Visitor<Void>() {
                    @Override
                    public Void visitBasic(com.fern.generator.exec.model.config.BasicLicense basicLicense) {
                        // Basic licenses don't need file copying
                        return null;
                    }

                    @Override
                    public Void visitCustom(com.fern.generator.exec.model.config.CustomLicense customLicense) {
                        Path dockerLicensePath = Paths.get("/tmp/LICENSE");
                        Path destinationPath = outputDirectory.resolve(customLicense.getFilename());

                        try {
                            if (Files.exists(dockerLicensePath)) {
                                Files.copy(dockerLicensePath, destinationPath);
                                log.debug("Successfully copied LICENSE file to {}", destinationPath);
                            }
                        } catch (IOException e) {
                            // File not found or copy failed - this is expected for remote generation where Fiddle
                            // handles it
                            // Silently fail to maintain backwards compatibility
                            log.debug(
                                    "Could not copy license file (expected for remote generation): {}", e.getMessage());
                        }
                        return null;
                    }

                    @Override
                    public Void visitUnknown(String unknownType) {
                        log.warn("Unknown license type: {}", unknownType);
                        return null;
                    }
                });
    }
}
