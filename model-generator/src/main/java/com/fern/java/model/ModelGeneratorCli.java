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

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.output.gradle.AbstractGradleDependency.DependencyType;
import com.fern.java.output.gradle.GradleDependency;
import java.util.Collections;
import java.util.List;

public final class ModelGeneratorCli extends AbstractGeneratorCli {

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir) {
        throw new RuntimeException("Download files mode is unsupported!");
    }

    @Override
    public void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            GithubOutputMode githubOutputMode) {
        generateTypes(generatorConfig, ir);
    }

    @Override
    public void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            GeneratorPublishConfig publishOutputMode) {
        generateTypes(generatorConfig, ir);
    }

    private void generateTypes(GeneratorConfig generatorConfig, IntermediateRepresentation ir) {
        ModelGeneratorContext context = new ModelGeneratorContext(ir, generatorConfig);

        // types
        TypesGenerator typesGenerator = new TypesGenerator(context);
        Result generatedTypes = typesGenerator.generateFiles();
        generatedTypes.getTypes().values().forEach(this::addGeneratedFile);
        generatedTypes.getInterfaces().values().forEach(this::addGeneratedFile);
    }

    @Override
    public List<GradleDependency> getBuildGradleDependencies() {
        return List.of(
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("io.github.fern-api")
                        .artifact("jackson-utils")
                        .version(GradleDependency.UTILS_VERSION)
                        .build(),
                GradleDependency.builder()
                        .type(DependencyType.API)
                        .group("com.fasterxml.jackson.datatype")
                        .artifact("jackson-datatype-jdk8")
                        .version(GradleDependency.JACKSON_VERSION)
                        .build());
    }

    @Override
    public List<String> getSubProjects() {
        return Collections.emptyList();
    }

    public static void main(String... args) {
        ModelGeneratorCli cli = new ModelGeneratorCli();
        cli.run(args);
    }
}
