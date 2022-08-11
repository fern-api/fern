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

import com.fern.codegen.GeneratedAbstractHttpServiceRegistry;
import com.fern.codegen.GeneratedClientWrapper;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ObjectMappers;
import com.fern.java.client.cli.CustomPluginConfig.ServerFramework;
import com.fern.jersey.client.ClientWrapperGenerator;
import com.fern.jersey.client.HttpServiceClientGenerator;
import com.fern.jersey.server.AbstractHttpServiceRegistryGenerator;
import com.fern.jersey.server.ErrorExceptionMapperGenerator;
import com.fern.jersey.server.HttpServiceJerseyServerGenerator;
import com.fern.model.codegen.ModelGenerator;
import com.fern.model.codegen.ModelGeneratorResult;
import com.fern.spring.server.DefaultExceptionHandlerGenerator;
import com.fern.spring.server.ErrorExceptionHandlerGenerator;
import com.fern.spring.server.HttpServiceSpringServerGenerator;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ErrorDeclaration;
import com.fern.types.ErrorName;
import com.fern.types.IntermediateRepresentation;
import com.fern.types.TypeDeclaration;
import com.fern.types.generators.GeneratorConfig;
import com.fern.types.generators.GeneratorOutputConfig;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.fiddle.generator.logging.types.ErrorExitStatusUpdate;
import com.fiddle.generator.logging.types.ExitStatusUpdate;
import com.fiddle.generator.logging.types.GeneratorUpdate;
import com.fiddle.generator.logging.types.InitUpdate;
import com.fiddle.generator.logging.types.PackageCoordinate;
import com.squareup.javapoet.JavaFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ClientGeneratorCli {

    private static final Logger log = LoggerFactory.getLogger(ClientGeneratorCli.class);

    private static final String SRC_MAIN_JAVA = "src/main/java";
    private static final String BUILD_GRADLE = "build.gradle";

    private ClientGeneratorCli() {}

    public static void main(String... args) {
        String pluginPath = args[0];
        GeneratorConfig generatorConfig = getGeneratorConfig(pluginPath);
        GeneratorLoggingClientWrapper loggingClient = new GeneratorLoggingClientWrapper(generatorConfig);

        try {
            FernPluginConfig fernPluginConfig = FernPluginConfig.create(generatorConfig, "0.0.82");
            List<PackageCoordinate> packageCoordinates = fernPluginConfig.getPackageCoordinates();
            loggingClient.sendUpdate(GeneratorUpdate.init(InitUpdate.builder()
                    .addAllPackagesToPublish(packageCoordinates)
                    .build()));

            createOutputDirectory(fernPluginConfig.generatorConfig().output());
            startGradleDaemon(fernPluginConfig);

            IntermediateRepresentation ir = getIr(fernPluginConfig.generatorConfig());
            generate(ir, fernPluginConfig);

            for (PackageCoordinate packageCoordinate : fernPluginConfig.getPackageCoordinates()) {
                loggingClient.sendUpdate(GeneratorUpdate.publishing(packageCoordinate));
            }
            publish(fernPluginConfig);

            for (PackageCoordinate packageCoordinate : fernPluginConfig.getPackageCoordinates()) {
                loggingClient.sendUpdate(GeneratorUpdate.published(packageCoordinate));
            }

            loggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
        } catch (Exception e) {
            log.error("Generator failed", e);
            loggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.error(
                    ErrorExitStatusUpdate.builder().message(e.getMessage()).build())));
        }
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
                fernPluginConfig.customPluginConfig().packagePrefix(),
                typeDefinitionsByName,
                errorDefinitionsByName,
                ir.constants());

        ModelGeneratorResult modelGeneratorResult = addModelFiles(ir, generatorContext, resultBuilder);
        switch (fernPluginConfig.customPluginConfig().mode()) {
            case MODEL:
                break;
            case CLIENT:
                addClientFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
            case SERVER:
                addServerFiles(fernPluginConfig, ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
            case CLIENT_AND_SERVER:
                addClientFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
                addServerFiles(fernPluginConfig, ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
        }
        CodeGenerationResult codeGenerationResult = resultBuilder.build();
        writeToFiles(codeGenerationResult, fernPluginConfig);
    }

    private static void publish(FernPluginConfig fernPluginConfig) {
        String outputDirectory = fernPluginConfig.generatorConfig().output().path();
        if (fernPluginConfig.generatorConfig().publish().isPresent()) {
            runCommandBlocking(
                    new String[] {"gradle", "--parallel", "--no-daemon", "publish"}, Paths.get(outputDirectory));
        }
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
        resultBuilder.addAllModelFiles(modelGeneratorResult.errors().values().stream()
                .map(GeneratedError::generatedBodyFile)
                .collect(Collectors.toList()));
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
        ClientWrapperGenerator clientWrapperGenerator = new ClientWrapperGenerator(
                generatorContext,
                generatedHttpServiceClients,
                ir.workspaceName().orElse("Untitled"));
        GeneratedClientWrapper generatedClientWrapper = clientWrapperGenerator.generate();
        resultBuilder.addClientFiles(generatedClientWrapper);
        resultBuilder.addAllClientFiles(generatedClientWrapper.nestedClientWrappers());
        for (GeneratedHttpServiceClient generatedHttpServiceClient : generatedHttpServiceClients) {
            resultBuilder.addClientFiles(generatedHttpServiceClient);
            generatedHttpServiceClient.generatedErrorDecoder().ifPresent(resultBuilder::addClientFiles);
        }
    }

    private static void addServerFiles(
            FernPluginConfig fernPluginConfig,
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        if (fernPluginConfig.customPluginConfig().getServerFrameworkEnums().contains(ServerFramework.JERSEY)) {
            addJerseyServerFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
        }
        if (fernPluginConfig.customPluginConfig().getServerFrameworkEnums().contains(ServerFramework.SPRING)) {
            addSpringServerFiles(ir, generatorContext, modelGeneratorResult, resultBuilder);
        }
    }

    private static void addJerseyServerFiles(
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        Map<HttpService, GeneratedHttpServiceServer> generatedHttpServiceServers = new LinkedHashMap<>();
        Map<ErrorName, Map<HttpService, List<HttpEndpoint>>> errorMap = new LinkedHashMap<>();
        ir.services().http().forEach(httpService -> {
            httpService.endpoints().forEach(httpEndpoint -> {
                buildErrorMap(httpService, httpEndpoint, errorMap);
            });
            GeneratedHttpServiceServer generatedHttpServiceServer =
                    generateJerseyHttpServiceServer(httpService, generatorContext, modelGeneratorResult);
            generatedHttpServiceServers.put(httpService, generatedHttpServiceServer);
        });
        resultBuilder.addAllJerseyServerFiles(generatedHttpServiceServers.values());

        List<GeneratedFile> generatedExceptionMappers = errorMap.keySet().stream()
                .map(errorName -> {
                    ErrorExceptionMapperGenerator errorExceptionMapperGenerator = new ErrorExceptionMapperGenerator(
                            generatorContext,
                            modelGeneratorResult.errors().get(errorName),
                            errorMap.get(errorName),
                            generatedHttpServiceServers,
                            modelGeneratorResult.endpointModels());
                    return errorExceptionMapperGenerator.generate();
                })
                .collect(Collectors.toList());
        resultBuilder.addAllJerseyServerFiles(generatedExceptionMappers);

        GeneratedAbstractHttpServiceRegistry abstractServiceRegistry = new AbstractHttpServiceRegistryGenerator(
                        generatorContext,
                        new ArrayList<>(generatedHttpServiceServers.values()),
                        generatedExceptionMappers)
                .generate();
        resultBuilder.addJerseyServerFiles(abstractServiceRegistry);
        resultBuilder.addJerseyServerFiles(abstractServiceRegistry.defaultExceptionMapper());
    }

    private static void addSpringServerFiles(
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        Map<HttpService, GeneratedHttpServiceServer> generatedHttpServiceServers = new LinkedHashMap<>();
        Map<ErrorName, Map<HttpService, List<HttpEndpoint>>> errorMap = new LinkedHashMap<>();
        ir.services().http().forEach(httpService -> {
            httpService.endpoints().forEach(httpEndpoint -> {
                buildErrorMap(httpService, httpEndpoint, errorMap);
            });
            GeneratedHttpServiceServer generatedHttpServiceServer =
                    generateSpringHttpServiceServer(httpService, generatorContext, modelGeneratorResult);
            generatedHttpServiceServers.put(httpService, generatedHttpServiceServer);
        });
        resultBuilder.addAllSpringServerFiles(generatedHttpServiceServers.values());

        List<GeneratedFile> generatedExceptionHandlers = errorMap.keySet().stream()
                .map(errorName -> {
                    ErrorExceptionHandlerGenerator errorExceptionHandlerGenerator = new ErrorExceptionHandlerGenerator(
                            generatorContext,
                            modelGeneratorResult.errors().get(errorName),
                            errorMap.get(errorName),
                            generatedHttpServiceServers,
                            modelGeneratorResult.endpointModels());
                    return errorExceptionHandlerGenerator.generate();
                })
                .collect(Collectors.toList());
        resultBuilder.addAllSpringServerFiles(generatedExceptionHandlers);

        resultBuilder.addSpringServerFiles(new DefaultExceptionHandlerGenerator(generatorContext).generate());
    }

    private static GeneratedHttpServiceServer generateSpringHttpServiceServer(
            HttpService httpService, GeneratorContext generatorContext, ModelGeneratorResult modelGeneratorResult) {
        HttpServiceSpringServerGenerator httpServiceSpringServerGenerator = new HttpServiceSpringServerGenerator(
                generatorContext,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(httpService),
                httpService);
        return httpServiceSpringServerGenerator.generate();
    }

    private static GeneratedHttpServiceServer generateJerseyHttpServiceServer(
            HttpService httpService, GeneratorContext generatorContext, ModelGeneratorResult modelGeneratorResult) {
        HttpServiceJerseyServerGenerator httpServiceJerseyServerGenerator = new HttpServiceJerseyServerGenerator(
                generatorContext,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(httpService),
                httpService);
        return httpServiceJerseyServerGenerator.generate();
    }

    private static void buildErrorMap(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            Map<ErrorName, Map<HttpService, List<HttpEndpoint>>> errorMap) {
        httpEndpoint.errors().value().forEach(responseError -> {
            ErrorName errorName = responseError.error();
            Map<HttpService, List<HttpEndpoint>> containingEndpoints;
            if (errorMap.containsKey(errorName)) {
                containingEndpoints = errorMap.get(errorName);
            } else {
                containingEndpoints = new HashMap<>();
                errorMap.put(errorName, containingEndpoints);
            }

            if (containingEndpoints.containsKey(httpService)) {
                containingEndpoints.get(httpService).add(httpEndpoint);
            } else {
                List<HttpEndpoint> httpEndpoints = new ArrayList<>();
                httpEndpoints.add(httpEndpoint);
                containingEndpoints.put(httpService, httpEndpoints);
            }
        });
    }

    private static synchronized void startGradleDaemon(FernPluginConfig fernPluginConfig) {
        String outputDirectory = fernPluginConfig.generatorConfig().output().path();

        writeFileContents(
                Paths.get(outputDirectory, "settings.gradle"),
                CodeGenerationResult.getSettingsDotGradle(fernPluginConfig));
        if (fernPluginConfig.generatorConfig().publish().isPresent()) {
            writeFileContents(
                    Paths.get(outputDirectory, "build.gradle"),
                    CodeGenerationResult.getBuildDotGradle(
                            fernPluginConfig.generatorConfig().publish().get()));
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

        if (!codeGenerationResult.jerseyServerFiles().isEmpty()) {
            String serverDirectory = fernPluginConfig.getServerProjectName(ServerFramework.JERSEY);
            codeGenerationResult
                    .jerseyServerFiles()
                    .forEach(serverFiles ->
                            writeFile(Paths.get(outputDirectory, serverDirectory, SRC_MAIN_JAVA), serverFiles.file()));
            writeFileContents(
                    Paths.get(outputDirectory, serverDirectory, BUILD_GRADLE),
                    CodeGenerationResult.getServerBuildGradle(fernPluginConfig, ServerFramework.JERSEY));
        }

        if (!codeGenerationResult.springServerFiles().isEmpty()) {
            String serverDirectory = fernPluginConfig.getServerProjectName(ServerFramework.SPRING);
            codeGenerationResult
                    .springServerFiles()
                    .forEach(serverFiles ->
                            writeFile(Paths.get(outputDirectory, serverDirectory, SRC_MAIN_JAVA), serverFiles.file()));
            writeFileContents(
                    Paths.get(outputDirectory, serverDirectory, BUILD_GRADLE),
                    CodeGenerationResult.getServerBuildGradle(fernPluginConfig, ServerFramework.SPRING));
        }
    }

    private static Process runCommandAsync(String[] command, Path workingDirectory) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command).directory(workingDirectory.toFile());
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

    private static void runCommandBlocking(String[] command, Path workingDirectory) {
        try {
            Process process = runCommandAsync(command, workingDirectory);
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Command failed with non-zero exit code: " + Arrays.toString(command));
            }
            process.waitFor();
        } catch (InterruptedException e) {
            throw new RuntimeException("Failed to run command", e);
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
