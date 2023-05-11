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

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.ir.v12.core.ObjectMappers;
import com.fern.ir.v12.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.AbstractPoetClassNameFactory;
import com.fern.java.CustomConfig;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.DownloadFilesCustomConfig;
import com.fern.java.client.generators.ClientOptionsGenerator;
import com.fern.java.client.generators.EnvironmentGenerator;
import com.fern.java.client.generators.RootClientGenerator;
import com.fern.java.client.generators.SampleAppGenerator;
import com.fern.java.client.generators.SubpackageClientGenerator;
import com.fern.java.client.generators.SuppliersGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.output.gradle.AbstractGradleDependency.DependencyType;
import com.fern.java.output.gradle.GradleDependency;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ClientGeneratorCli extends AbstractGeneratorCli<CustomConfig, DownloadFilesCustomConfig> {

    private static final Logger log = LoggerFactory.getLogger(ClientGeneratorCli.class);

    private final List<String> subprojects = new ArrayList<>();

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            DownloadFilesCustomConfig customConfig) {
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(
                customConfig.packagePrefix().map(List::of).orElseGet(Collections::emptyList));
        ClientGeneratorContext context = new ClientGeneratorContext(
                ir,
                generatorConfig,
                CustomConfig.builder()
                        .unknownAsOptional(customConfig.unknownAsOptional())
                        .wrappedAliases(customConfig.wrappedAliases())
                        .build(),
                clientPoetClassNameFactory);
        generateClient(context, ir);
    }

    @Override
    public void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig,
            GithubOutputMode githubOutputMode) {
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(
                AbstractPoetClassNameFactory.getPackagePrefixWithOrgAndApiName(ir, generatorConfig.getOrganization()));
        ClientGeneratorContext context =
                new ClientGeneratorContext(ir, generatorConfig, customConfig, clientPoetClassNameFactory);
        GeneratedRootClient generatedClientWrapper = generateClient(context, ir);
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
        ClientPoetClassNameFactory clientPoetClassNameFactory = new ClientPoetClassNameFactory(
                AbstractPoetClassNameFactory.getPackagePrefixWithOrgAndApiName(ir, generatorConfig.getOrganization()));
        ClientGeneratorContext context =
                new ClientGeneratorContext(ir, generatorConfig, customConfig, clientPoetClassNameFactory);
        generateClient(context, ir);
    }

    public GeneratedRootClient generateClient(ClientGeneratorContext context, IntermediateRepresentation ir) {

        // core
        ObjectMappersGenerator objectMappersGenerator = new ObjectMappersGenerator(context);
        GeneratedObjectMapper objectMapper = objectMappersGenerator.generateFile();
        this.addGeneratedFile(objectMapper);

        EnvironmentGenerator environmentGenerator = new EnvironmentGenerator(context);
        GeneratedEnvironmentsClass generatedEnvironmentsClass = environmentGenerator.generateFile();
        this.addGeneratedFile(generatedEnvironmentsClass);

        ClientOptionsGenerator clientOptionsGenerator = new ClientOptionsGenerator(context, generatedEnvironmentsClass);
        GeneratedClientOptions generatedClientOptions = clientOptionsGenerator.generateFile();
        this.addGeneratedFile(generatedClientOptions);

        SuppliersGenerator suppliersGenerator = new SuppliersGenerator(context);
        GeneratedJavaFile generatedSuppliersFile = suppliersGenerator.generateFile();
        this.addGeneratedFile(generatedSuppliersFile);

        // types
        TypesGenerator typesGenerator = new TypesGenerator(context);
        Result generatedTypes = typesGenerator.generateFiles();
        generatedTypes.getTypes().values().forEach(this::addGeneratedFile);
        generatedTypes.getInterfaces().values().forEach(this::addGeneratedFile);

        // subpackage clients
        ir.getSubpackages().values().forEach(subpackage -> {
            if (!subpackage.getHasEndpointsInTree()) {
                return;
            }
            SubpackageClientGenerator httpServiceClientGenerator = new SubpackageClientGenerator(
                    subpackage,
                    context,
                    objectMapper,
                    context,
                    generatedClientOptions,
                    generatedSuppliersFile,
                    generatedEnvironmentsClass,
                    generatedTypes.getInterfaces());
            GeneratedClient generatedClient = httpServiceClientGenerator.generateFile();
            this.addGeneratedFile(generatedClient);
            this.addGeneratedFile(generatedClient.clientImpl());
            generatedClient.wrappedRequests().forEach(this::addGeneratedFile);
        });

        // root client
        RootClientGenerator rootClientGenerator = new RootClientGenerator(
                context,
                objectMapper,
                context,
                generatedClientOptions,
                generatedSuppliersFile,
                generatedEnvironmentsClass,
                generatedTypes.getInterfaces());
        GeneratedRootClient generatedRootClient = rootClientGenerator.generateFile();
        this.addGeneratedFile(generatedRootClient);
        this.addGeneratedFile(generatedRootClient.clientImpl());
        this.addGeneratedFile(generatedRootClient.builderClass());
        generatedRootClient.wrappedRequests().forEach(this::addGeneratedFile);

        return generatedRootClient;
    }

    @Override
    public List<GradleDependency> getBuildGradleDependencies() {
        return List.of(
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("com.squareup.okhttp3")
                        .artifact("okhttp")
                        .version(GradleDependency.OKHTTP_VERSION)
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
                        .build());
    }

    @Override
    public List<String> getSubProjects() {
        return subprojects;
    }

    @Override
    public DownloadFilesCustomConfig getDownloadFilesCustomConfig(GeneratorConfig generatorConfig) {
        if (generatorConfig.getCustomConfig().isPresent()) {
            JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(
                    generatorConfig.getCustomConfig().get());
            return ObjectMappers.JSON_MAPPER.convertValue(node, DownloadFilesCustomConfig.class);
        }
        return DownloadFilesCustomConfig.builder().build();
    }

    @Override
    public CustomConfig getCustomConfig(GeneratorConfig generatorConfig) {
        if (generatorConfig.getCustomConfig().isPresent()) {
            JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(
                    generatorConfig.getCustomConfig().get());
            return ObjectMappers.JSON_MAPPER.convertValue(node, CustomConfig.class);
        }
        return CustomConfig.builder().build();
    }

    public static void main(String... args) {
        ClientGeneratorCli cli = new ClientGeneratorCli();
        cli.run(args);
    }
}
