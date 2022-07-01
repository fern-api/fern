package com.fern.java.client.cli;

import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ObjectMappers;
import com.fern.jersey.client.HttpServiceClientGenerator;
import com.fern.jersey.server.HttpServiceServerGenerator;
import com.fern.model.codegen.ModelGenerator;
import com.fern.model.codegen.ModelGeneratorResult;
import com.fern.types.errors.ErrorDeclaration;
import com.fern.types.errors.ErrorName;
import com.fern.types.generators.config.GeneratorConfig;
import com.fern.types.generators.config.GeneratorOutputConfig;
import com.fern.types.ir.IntermediateRepresentation;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.TypeDeclaration;
import com.squareup.javapoet.JavaFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class ClientGeneratorCli {

    private static final String SRC_MAIN_JAVA = "src/main/java";
    private static final String BUILD_GRADLE = "build.gradle";

    public static final String VERSION_ENV_NAME = "VERSION";

    private ClientGeneratorCli() {}

    public static void main(String... args) {
        String pluginPath = args[0];
        GeneratorConfig generatorConfig = getGeneratorConfig(pluginPath);

        String version = System.getenv(ClientGeneratorCli.VERSION_ENV_NAME);
        if (version == null) {
            throw new RuntimeException("Failed to find VERSION environment variable!");
        }

        FernPluginConfig fernPluginConfig = FernPluginConfig.create(generatorConfig, version);
        createOutputDirectory(fernPluginConfig.generatorConfig().output());
        IntermediateRepresentation ir = getIr(fernPluginConfig.generatorConfig());
        generate(ir, fernPluginConfig);
    }

    private static GeneratorConfig getGeneratorConfig(String pluginPath) {
        try {
            return ObjectMappers.CLIENT_OBJECT_MAPPER.readValue(new File(pluginPath), GeneratorConfig.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read plugin configuration", e);
        }
    }

    private static void createOutputDirectory(GeneratorOutputConfig generatorOutputConfig) {
        Path path = Paths.get(generatorOutputConfig.path());
        if (!Files.exists(path)) {
            try {
                Files.createDirectories(path);
            } catch (IOException e) {
                throw new RuntimeException("Failed to create output directory", e);
            }
        }
    }

    private static IntermediateRepresentation getIr(GeneratorConfig generatorConfig) {
        try {
            return ObjectMappers.CLIENT_OBJECT_MAPPER.readValue(
                    new File(generatorConfig.irFilepath()), IntermediateRepresentation.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ir", e);
        }
    }

    private static void generate(IntermediateRepresentation ir, FernPluginConfig fernPluginConfig) {
        ImmutableCodeGenerationResult.Builder resultBuilder = CodeGenerationResult.builder();
        Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName =
                ir.types().stream().collect(Collectors.toUnmodifiableMap(TypeDeclaration::name, Function.identity()));
        Map<ErrorName, ErrorDeclaration> errorDefinitionsByName =
                ir.errors().stream().collect(Collectors.toUnmodifiableMap(ErrorDeclaration::name, Function.identity()));
        GeneratorContext generatorContext = new GeneratorContext(
                fernPluginConfig.customPluginConfig().packagePrefix(), typeDefinitionsByName, errorDefinitionsByName);

        ModelGeneratorResult modelGeneratorResult = addModelFiles(ir, generatorContext, resultBuilder);
        switch (fernPluginConfig.customPluginConfig().mode()) {
            case MODEL:
                break;
            case CLIENT:
                addClientFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
            case SERVER:
                addServerFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
            case CLIENT_AND_SERVER:
                addClientFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
                addServerFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
        }
        CodeGenerationResult codeGenerationResult = resultBuilder.build();
        writeToFiles(codeGenerationResult, fernPluginConfig);
    }

    private static ModelGeneratorResult addModelFiles(
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        ModelGenerator modelGenerator =
                new ModelGenerator(ir.services().http(), ir.types(), ir.errors(), generatorContext);
        ModelGeneratorResult modelGeneratorResult = modelGenerator.generate();
        resultBuilder.addAllModelFiles(modelGeneratorResult.aliases());
        resultBuilder.addAllModelFiles(modelGeneratorResult.enums());
        resultBuilder.addAllModelFiles(modelGeneratorResult.interfaces().values());
        resultBuilder.addAllModelFiles(modelGeneratorResult.objects());
        resultBuilder.addAllModelFiles(modelGeneratorResult.unions());
        resultBuilder.addAllModelFiles(modelGeneratorResult.errors().values());
        resultBuilder.addAllModelFiles(modelGeneratorResult.endpointModelFiles());
        return modelGeneratorResult;
    }

    private static void addClientFiles(
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        List<GeneratedHttpServiceClient> generatedHttpServiceClients = ir.services().http().stream()
                .map(httpService -> {
                    HttpServiceClientGenerator httpServiceClientGenerator = new HttpServiceClientGenerator(
                            generatorContext,
                            modelGeneratorResult.endpointModels().get(httpService),
                            modelGeneratorResult.errors(),
                            httpService);
                    return httpServiceClientGenerator.generate();
                })
                .collect(Collectors.toList());
        for (GeneratedHttpServiceClient generatedHttpServiceClient : generatedHttpServiceClients) {
            resultBuilder.addClientFiles(generatedHttpServiceClient);
            generatedHttpServiceClient.generatedErrorDecoder().ifPresent(resultBuilder::addClientFiles);
        }
    }

    private static void addServerFiles(
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        List<GeneratedHttpServiceServer> generatedHttpServiceServers = ir.services().http().stream()
                .map(httpService -> {
                    HttpServiceServerGenerator httpServiceServerGenerator = new HttpServiceServerGenerator(
                            generatorContext,
                            modelGeneratorResult.errors(),
                            modelGeneratorResult.endpointModels().get(httpService),
                            httpService);
                    return httpServiceServerGenerator.generate();
                })
                .collect(Collectors.toList());
        for (GeneratedHttpServiceServer generatedHttpServiceServer : generatedHttpServiceServers) {
            resultBuilder.addServerFiles(generatedHttpServiceServer);
        }
    }

    private static synchronized void writeToFiles(
            CodeGenerationResult codeGenerationResult, FernPluginConfig fernPluginConfig) {
        String outputDirectory = fernPluginConfig.generatorConfig().output().path();

        if (!codeGenerationResult.modelFiles().isEmpty()) {
            String modelDirectory = fernPluginConfig.getModelProjectName();
            codeGenerationResult
                    .modelFiles()
                    .forEach(modelFile ->
                            writeFile(Paths.get(outputDirectory, modelDirectory, SRC_MAIN_JAVA), modelFile.file()));
            writeFileContents(
                    Paths.get(outputDirectory, modelDirectory, BUILD_GRADLE),
                    CodeGenerationResult.getModelBuildGradle(fernPluginConfig));
        }

        if (!codeGenerationResult.clientFiles().isEmpty()) {
            String clientDirectory = fernPluginConfig.getClientProjectName();
            codeGenerationResult
                    .clientFiles()
                    .forEach(clientFile ->
                            writeFile(Paths.get(outputDirectory, clientDirectory, SRC_MAIN_JAVA), clientFile.file()));
            writeFileContents(
                    Paths.get(outputDirectory, clientDirectory, BUILD_GRADLE),
                    CodeGenerationResult.getClientBuildGradle(fernPluginConfig));
        }

        if (!codeGenerationResult.serverFiles().isEmpty()) {
            String serverDirectory = fernPluginConfig.getServerProjectName();
            codeGenerationResult
                    .serverFiles()
                    .forEach(serverFiles ->
                            writeFile(Paths.get(outputDirectory, serverDirectory, SRC_MAIN_JAVA), serverFiles.file()));
            writeFileContents(
                    Paths.get(outputDirectory, serverDirectory, BUILD_GRADLE),
                    CodeGenerationResult.getServerBuildGradle(fernPluginConfig));
        }

        writeFileContents(
                Paths.get(outputDirectory, "settings.gradle"),
                CodeGenerationResult.getSettingsDotGradle(fernPluginConfig));
        Path gradleResourcesFolder = Paths.get("/gradle-resources");
        try (Stream<Path> gradleResources = Files.walk(gradleResourcesFolder)) {
            gradleResources.forEach(gradleResource -> {
                Path pathToCreate =
                        Paths.get(outputDirectory).resolve(gradleResourcesFolder.relativize(gradleResource));
                try {
                    if (Files.isRegularFile(gradleResource)) {
                        Files.move(gradleResource, pathToCreate);
                    } else if (Files.isDirectory(gradleResource) && !Files.exists(pathToCreate)) {
                        Files.createDirectory(pathToCreate);
                    }
                } catch (IOException e) {
                    throw new RuntimeException("Failed to output gradle file: " + gradleResource.toAbsolutePath(), e);
                }
            });
        } catch (IOException e) {
            throw new RuntimeException("Failed to output gradle files", e);
        }

        if (fernPluginConfig.generatorConfig().publish().isPresent()) {
            writeFileContents(
                    Paths.get(outputDirectory, "build.gradle"),
                    CodeGenerationResult.getBuildDotGradle(
                            fernPluginConfig.generatorConfig().organization(),
                            fernPluginConfig.generatorConfig().publish().get()));
            runPublish(Paths.get(outputDirectory));
        }
    }

    private static void runPublish(Path outputDirectory) {
        try {
            ProcessBuilder pb = new ProcessBuilder("./gradlew", "publish").directory(outputDirectory.toFile());
            Process process = pb.start();
            StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream());
            StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream());
            errorGobbler.start();
            outputGobbler.start();
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Failed to run fern generate!");
            }
            process.waitFor();
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to publish", e);
        }
    }

    private static void writeFileContents(Path path, String contents) {
        try {
            Files.writeString(path, contents);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write .gitignore ", e);
        }
    }

    private static void writeFile(Path path, JavaFile javaFile) {
        try {
            javaFile.writeToFile(path.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to write generated java file: " + javaFile.typeSpec.name, e);
        }
    }
}
