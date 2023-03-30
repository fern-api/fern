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
import com.fern.codegen.GeneratedAuthSchemes;
import com.fern.codegen.GeneratedClientWrapper;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.generator.auth.AuthGenerator;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.ObjectMappers;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorOutputConfig;
import com.fern.ir.v9.model.auth.AuthScheme;
import com.fern.ir.v9.model.errors.DeclaredErrorName;
import com.fern.ir.v9.model.errors.ErrorDeclaration;
import com.fern.ir.v9.model.ir.IntermediateRepresentation;
import com.fern.ir.v9.model.http.HttpEndpoint;
import com.fern.ir.v9.model.http.HttpService;
import com.fern.ir.v9.model.types.DeclaredTypeName;
import com.fern.ir.v9.model.types.TypeDeclaration;
import com.fern.java.client.cli.CustomPluginConfig.ServerFramework;
import com.fern.jersey.client.ClientErrorGenerator;
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
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

            createOutputDirectory(fernPluginConfig.generatorConfig().getOutput());
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
        Path path = Paths.get(generatorOutputConfig.getPath());
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
                    new File(generatorConfig.getIrFilepath()), IntermediateRepresentation.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read ir", e);
        }
    }

    private static void generate(IntermediateRepresentation ir, FernPluginConfig fernPluginConfig) {
        ImmutableCodeGenerationResult.Builder resultBuilder = CodeGenerationResult.builder();
        Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName = ir.getTypes().stream()
                .collect(Collectors.toUnmodifiableMap(TypeDeclaration::getName, Function.identity()));
        Map<DeclaredErrorName, ErrorDeclaration> errorDefinitionsByName = ir.getErrors().stream()
                .collect(Collectors.toUnmodifiableMap(ErrorDeclaration::getName, Function.identity()));
        List<String> packagePrefixTokens =
                List.of("com", fernPluginConfig.generatorConfig().getOrganization(), ir.getApiName());
        String unreplacedPackagePrefix = String.join(".", packagePrefixTokens);
        GeneratorContext generatorContext = new GeneratorContext(
                ir,
                fernPluginConfig.generatorConfig().getOrganization(),
                unreplacedPackagePrefix.replaceAll("[^a-zA-Z0-9]", "."),
                typeDefinitionsByName,
                errorDefinitionsByName,
                ir.getAuth(),
                ir.getConstants());

        ModelGeneratorResult modelGeneratorResult = addModelFiles(ir, generatorContext, resultBuilder);
        switch (fernPluginConfig.customPluginConfig().mode()) {
            case MODEL:
                break;
            case CLIENT:
                addClientFiles(fernPluginConfig, ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
            case SERVER:
                addServerFiles(fernPluginConfig, ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
            case CLIENT_AND_SERVER:
                addClientFiles(fernPluginConfig, ir, generatorContext, modelGeneratorResult, resultBuilder);
                addServerFiles(fernPluginConfig, ir, generatorContext, modelGeneratorResult, resultBuilder);
                break;
        }
        CodeGenerationResult codeGenerationResult = resultBuilder.build();
        writeToFiles(codeGenerationResult, fernPluginConfig);
    }

    private static void publish(FernPluginConfig fernPluginConfig) {
        String outputDirectory = fernPluginConfig.generatorConfig().getOutput().getPath();
        if (fernPluginConfig.generatorConfig().getPublish().isPresent()) {
            runCommandBlocking(
                    new String[] {"gradle", "--parallel", "--no-daemon", "publish"}, Paths.get(outputDirectory));
        }
    }

    private static ModelGeneratorResult addModelFiles(
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        ModelGenerator modelGenerator =
                new ModelGenerator(ir.getServices().getHttp(), ir.getTypes(), ir.getErrors(), generatorContext);
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
            FernPluginConfig fernPluginConfig,
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        AuthGenerator authGenerator =
                new AuthGenerator(ir.getAuth(), generatorContext, ir.getApiName(), PackageType.CLIENT);
        Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes = authGenerator.generate();

        Map<DeclaredErrorName, IGeneratedFile> generatedErrors = ir.getErrors().stream()
                .collect(Collectors.toMap(ErrorDeclaration::getName, errorDefinition -> {
                    ClientErrorGenerator clientErrorGenerator = new ClientErrorGenerator(
                            errorDefinition, generatorContext, modelGeneratorResult.interfaces());
                    return clientErrorGenerator.generate();
                }));
        resultBuilder.addAllClientFiles(generatedErrors.values());

        List<GeneratedHttpServiceClient> generatedHttpServiceClients = ir.getServices().getHttp().stream()
                .map(httpService -> {
                    HttpServiceClientGenerator httpServiceClientGenerator = new HttpServiceClientGenerator(
                            generatorContext,
                            httpService,
                            modelGeneratorResult.endpointModels().get(httpService),
                            generatedErrors,
                            maybeGeneratedAuthSchemes);
                    return httpServiceClientGenerator.generate();
                })
                .collect(Collectors.toList());
        ClientWrapperGenerator clientWrapperGenerator = new ClientWrapperGenerator(
                generatorContext,
                generatedHttpServiceClients,
                fernPluginConfig.generatorConfig().getOrganization(),
                ir.getApiName(),
                maybeGeneratedAuthSchemes);
        GeneratedClientWrapper generatedClientWrapper = clientWrapperGenerator.generate();
        maybeGeneratedAuthSchemes.ifPresent(generatedAuthSchemes -> {
            resultBuilder.addAllClientFiles(
                    generatedAuthSchemes.generatedAuthSchemes().values());
            resultBuilder.addClientFiles(generatedAuthSchemes);
        });
        resultBuilder.addClientFiles(generatedClientWrapper);
        resultBuilder.addAllClientFiles(generatedClientWrapper.nestedClientWrappers());
        for (GeneratedHttpServiceClient generatedHttpServiceClient : generatedHttpServiceClients) {
            resultBuilder.addClientFiles(generatedHttpServiceClient);
            resultBuilder.addClientFiles(generatedHttpServiceClient.serviceInterface());
            resultBuilder.addAllClientFiles(
                    generatedHttpServiceClient.serviceInterface().endpointFiles().values().stream()
                            .flatMap(Optional::stream)
                            .collect(Collectors.toList()));
            resultBuilder.addAllClientFiles(generatedHttpServiceClient
                    .serviceInterface()
                    .endpointExceptions()
                    .values());
            generatedHttpServiceClient
                    .serviceInterface()
                    .generatedErrorDecoder()
                    .ifPresent(resultBuilder::addClientFiles);
        }
    }

    private static void addServerFiles(
            FernPluginConfig fernPluginConfig,
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        AuthGenerator authGenerator =
                new AuthGenerator(ir.getAuth(), generatorContext, ir.getApiName(), PackageType.SERVER);
        Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes = authGenerator.generate();
        Map<AuthScheme, GeneratedFile> generatedAuthSchemes = maybeGeneratedAuthSchemes
                .map(GeneratedAuthSchemes::generatedAuthSchemes)
                .orElseGet(Collections::emptyMap);
        if (fernPluginConfig.customPluginConfig().getServerFrameworkEnums().contains(ServerFramework.JERSEY)) {
            resultBuilder.addAllJerseyServerFiles(generatedAuthSchemes.values());
            addJerseyServerFiles(ir, generatorContext, modelGeneratorResult, generatedAuthSchemes, resultBuilder);
            resultBuilder.addAllJerseyServerFiles(generatedAuthSchemes.values());
            maybeGeneratedAuthSchemes.ifPresent(resultBuilder::addJerseyServerFiles);
        }
        if (fernPluginConfig.customPluginConfig().getServerFrameworkEnums().contains(ServerFramework.SPRING)) {
            resultBuilder.addAllSpringServerFiles(generatedAuthSchemes.values());
            addSpringServerFiles(ir, generatorContext, modelGeneratorResult, generatedAuthSchemes, resultBuilder);
            resultBuilder.addAllSpringServerFiles(generatedAuthSchemes.values());
            maybeGeneratedAuthSchemes.ifPresent(resultBuilder::addSpringServerFiles);
        }
    }

    private static void addJerseyServerFiles(
            IntermediateRepresentation ir,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            Map<AuthScheme, GeneratedFile> generatedAuthSchemes,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        Map<HttpService, GeneratedHttpServiceServer> generatedHttpServiceServers = new LinkedHashMap<>();
        Map<DeclaredErrorName, Map<HttpService, List<HttpEndpoint>>> errorMap = new LinkedHashMap<>();
        ir.getServices().getHttp().forEach(httpService -> {
            httpService.getEndpoints().forEach(httpEndpoint -> {
                buildErrorMap(httpService, httpEndpoint, errorMap);
            });
            GeneratedHttpServiceServer generatedHttpServiceServer = generateJerseyHttpServiceServer(
                    httpService, generatorContext, modelGeneratorResult, generatedAuthSchemes);
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
            Map<AuthScheme, GeneratedFile> generatedAuthSchemes,
            ImmutableCodeGenerationResult.Builder resultBuilder) {
        Map<HttpService, GeneratedHttpServiceServer> generatedHttpServiceServers = new LinkedHashMap<>();
        Map<DeclaredErrorName, Map<HttpService, List<HttpEndpoint>>> errorMap = new LinkedHashMap<>();
        ir.getServices().getHttp().forEach(httpService -> {
            httpService.getEndpoints().forEach(httpEndpoint -> {
                buildErrorMap(httpService, httpEndpoint, errorMap);
            });
            GeneratedHttpServiceServer generatedHttpServiceServer = generateSpringHttpServiceServer(
                    httpService, generatorContext, modelGeneratorResult, generatedAuthSchemes);
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
            HttpService httpService,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            Map<AuthScheme, GeneratedFile> generatedAuthSchemes) {
        HttpServiceSpringServerGenerator httpServiceSpringServerGenerator = new HttpServiceSpringServerGenerator(
                generatorContext,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(httpService),
                generatedAuthSchemes,
                httpService);
        return httpServiceSpringServerGenerator.generate();
    }

    private static GeneratedHttpServiceServer generateJerseyHttpServiceServer(
            HttpService httpService,
            GeneratorContext generatorContext,
            ModelGeneratorResult modelGeneratorResult,
            Map<AuthScheme, GeneratedFile> generatedAuthSchemes) {
        HttpServiceJerseyServerGenerator httpServiceJerseyServerGenerator = new HttpServiceJerseyServerGenerator(
                generatorContext,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(httpService),
                generatedAuthSchemes,
                httpService);
        return httpServiceJerseyServerGenerator.generate();
    }

    private static void buildErrorMap(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            Map<DeclaredErrorName, Map<HttpService, List<HttpEndpoint>>> errorMap) {
        httpEndpoint.getErrors().get().forEach(responseError -> {
            DeclaredErrorName errorName = responseError.getError();
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
        String outputDirectory = fernPluginConfig.generatorConfig().getOutput().getPath();

        writeFileContents(
                Paths.get(outputDirectory, "settings.gradle"),
                CodeGenerationResult.getSettingsDotGradle(fernPluginConfig));
        writeFileContents(Paths.get(outputDirectory, ".gitignore"), CodeGenerationResult.getGitignore());
        if (fernPluginConfig.generatorConfig().getPublish().isPresent()) {
            writeFileContents(
                    Paths.get(outputDirectory, "build.gradle"),
                    CodeGenerationResult.getBuildDotGradle(
                            fernPluginConfig.generatorConfig().getPublish().get()));
        }
    }

    private static synchronized void writeToFiles(
            CodeGenerationResult codeGenerationResult, FernPluginConfig fernPluginConfig) {
        String outputDirectory = fernPluginConfig.generatorConfig().getOutput().getPath();

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
