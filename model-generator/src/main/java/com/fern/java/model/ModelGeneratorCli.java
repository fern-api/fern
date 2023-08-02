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

package com.fern.java.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.irV16.core.ObjectMappers;
import com.fern.irV16.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.CustomConfig;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.DownloadFilesCustomConfig;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.output.gradle.AbstractGradleDependency.DependencyType;
import com.fern.java.output.gradle.GradleDependency;
import java.util.Collections;
import java.util.List;

public final class ModelGeneratorCli extends AbstractGeneratorCli<CustomConfig, DownloadFilesCustomConfig> {

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            DownloadFilesCustomConfig customConfig) {
        throw new RuntimeException("Download files mode is unsupported!");
    }

    @Override
    public void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig,
            GithubOutputMode githubOutputMode) {
        generateTypes(generatorConfig, ir, customConfig);
    }

    @Override
    public void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig,
            GeneratorPublishConfig publishOutputMode) {
        generateTypes(generatorConfig, ir, customConfig);
    }

    private void generateTypes(
            GeneratorConfig generatorConfig, IntermediateRepresentation ir, CustomConfig customConfig) {
        ModelGeneratorContext context = new ModelGeneratorContext(ir, generatorConfig, customConfig);

        // core
        ObjectMappersGenerator objectMappersGenerator = new ObjectMappersGenerator(context);
        this.addGeneratedFile(objectMappersGenerator.generateFile());

        // types
        TypesGenerator typesGenerator = new TypesGenerator(context, false);
        Result generatedTypes = typesGenerator.generateFiles();
        generatedTypes.getTypes().values().forEach(this::addGeneratedFile);
        generatedTypes.getInterfaces().values().forEach(this::addGeneratedFile);
    }

    @Override
    public List<GradleDependency> getBuildGradleDependencies() {
        return List.of(
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
                        .group("com.fasterxml.jackson.datatype")
                        .artifact("jackson-datatype-jsr310")
                        .version(GradleDependency.JACKSON_JDK8_VERSION)
                        .build());
    }

    @Override
    public List<String> getSubProjects() {
        return Collections.emptyList();
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

    @Override
    public DownloadFilesCustomConfig getDownloadFilesCustomConfig(GeneratorConfig generatorConfig) {
        if (generatorConfig.getCustomConfig().isPresent()) {
            JsonNode node = ObjectMappers.JSON_MAPPER.valueToTree(
                    generatorConfig.getCustomConfig().get());
            return ObjectMappers.JSON_MAPPER.convertValue(node, DownloadFilesCustomConfig.class);
        }
        return DownloadFilesCustomConfig.builder().build();
    }

    public static void main(String... args) {
        ModelGeneratorCli cli = new ModelGeneratorCli();
        cli.run(args);
    }
}
