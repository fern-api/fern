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

package com.fern.java.client;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.CustomConfig;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.client.generators.ClientErrorGenerator;
import com.fern.java.client.generators.ClientWrapperGenerator;
import com.fern.java.client.generators.EnvironmentGenerator;
import com.fern.java.client.generators.HttpServiceClientGenerator;
import com.fern.java.client.generators.SampleAppGenerator;
import com.fern.java.generators.AuthGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.gradle.AbstractGradleDependency.DependencyType;
import com.fern.java.output.gradle.GradleDependency;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ClientGeneratorCli extends AbstractGeneratorCli {

    private static final Logger log = LoggerFactory.getLogger(ClientGeneratorCli.class);

    private final List<String> subprojects = new ArrayList<>();

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig) {
        throw new RuntimeException("Download files mode is unsupported!");
    }

    @Override
    public void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig,
            GithubOutputMode githubOutputMode) {
        ClientGeneratorContext context = new ClientGeneratorContext(ir, generatorConfig, customConfig);
        GeneratedClientWrapper generatedClientWrapper = generateClient(context, ir);
        SampleAppGenerator sampleAppGenerator = new SampleAppGenerator(context, generatedClientWrapper);
        sampleAppGenerator.generateFiles().forEach(this::addGeneratedFile);
        subprojects.add(SampleAppGenerator.SAMPLE_APP_DIRECTORY);
    }

    @Override
    public void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig,
            GeneratorPublishConfig publishOutputMode) {
        ClientGeneratorContext context = new ClientGeneratorContext(ir, generatorConfig, customConfig);
        generateClient(context, ir);
    }

    public GeneratedClientWrapper generateClient(ClientGeneratorContext context, IntermediateRepresentation ir) {

        // core
        ObjectMappersGenerator objectMappersGenerator = new ObjectMappersGenerator(context);
        GeneratedJavaFile objectMapper = objectMappersGenerator.generateFile();
        this.addGeneratedFile(objectMapper);

        EnvironmentGenerator environmentGenerator = new EnvironmentGenerator(context);
        Optional<GeneratedEnvironmentsClass> generatedEnvironmentsClass = environmentGenerator.generateFile();
        generatedEnvironmentsClass.ifPresent(this::addGeneratedFile);

        // auth
        AuthGenerator authGenerator = new AuthGenerator(context);
        Optional<GeneratedAuthFiles> maybeAuth = authGenerator.generate();
        maybeAuth.ifPresent(this::addGeneratedFile);

        // types
        TypesGenerator typesGenerator = new TypesGenerator(context);
        Result generatedTypes = typesGenerator.generateFiles();
        generatedTypes.getTypes().values().forEach(this::addGeneratedFile);
        generatedTypes.getInterfaces().values().forEach(this::addGeneratedFile);

        // errors
        Map<DeclaredErrorName, GeneratedJavaFile> errors = ir.getErrors().stream()
                .collect(Collectors.toMap(ErrorDeclaration::getName, errorDeclaration -> {
                    ClientErrorGenerator clientErrorGenerator =
                            new ClientErrorGenerator(errorDeclaration, context, generatedTypes.getInterfaces());
                    return clientErrorGenerator.generateFile();
                }));
        errors.values().forEach(this::addGeneratedFile);

        // services
        List<GeneratedServiceClient> generatedServiceClients = ir.getServices().getHttp().stream()
                .map(httpService -> {
                    HttpServiceClientGenerator httpServiceClientGenerator =
                            new HttpServiceClientGenerator(context, httpService, errors, maybeAuth, objectMapper);
                    return httpServiceClientGenerator.generateFile();
                })
                .collect(Collectors.toList());
        generatedServiceClients.forEach(this::addGeneratedFile);
        generatedServiceClients.forEach(generatedServiceClient -> {
            this.addGeneratedFile(generatedServiceClient);
            this.addGeneratedFile(generatedServiceClient.jerseyServiceInterfaceOutput());
            this.addGeneratedFile(
                    generatedServiceClient.jerseyServiceInterfaceOutput().errorDecoder());
            generatedServiceClient.generatedEndpointRequestOutputs().forEach(this::addGeneratedFile);
            generatedServiceClient
                    .jerseyServiceInterfaceOutput()
                    .endpointExceptions()
                    .values()
                    .forEach(this::addGeneratedFile);
        });

        // client wrapper
        ClientWrapperGenerator clientWrapperGenerator =
                new ClientWrapperGenerator(context, generatedServiceClients, generatedEnvironmentsClass, maybeAuth);
        GeneratedClientWrapper generatedClientWrapper = clientWrapperGenerator.generateFile();
        this.addGeneratedFile(generatedClientWrapper);
        generatedClientWrapper.nestedClients().forEach(this::addGeneratedFile);

        return generatedClientWrapper;
    }

    @Override
    public List<GradleDependency> getBuildGradleDependencies() {
        return List.of(
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("io.github.fern-api")
                        .artifact("jersey-utils")
                        .version(GradleDependency.UTILS_VERSION)
                        .build(),
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("com.fasterxml.jackson.core")
                        .artifact("jackson-databind")
                        .version(GradleDependency.JACKSON_DATABIND_VERSION)
                        .build(),
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("com.fasterxml.jackson.datatype")
                        .artifact("jackson-datatype-jdk8")
                        .version(GradleDependency.JACKSON_JDK8_VERSION)
                        .build(),
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("io.github.openfeign")
                        .artifact("feign-jackson")
                        .version(GradleDependency.FEIGN_VERSION)
                        .build(),
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("io.github.openfeign")
                        .artifact("feign-core")
                        .version(GradleDependency.FEIGN_VERSION)
                        .build(),
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("io.github.openfeign")
                        .artifact("feign-jaxrs2")
                        .version(GradleDependency.FEIGN_VERSION)
                        .build());
    }

    @Override
    public List<String> getSubProjects() {
        return subprojects;
    }

    public static void main(String... args) {
        ClientGeneratorCli cli = new ClientGeneratorCli();
        cli.run(args);
    }
}
