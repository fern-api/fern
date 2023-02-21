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

package com.fern.java.spring;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GithubOutputMode;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.CustomConfig;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.generators.AuthGenerator;
import com.fern.java.generators.ObjectMappersGenerator;
import com.fern.java.generators.TypesGenerator;
import com.fern.java.generators.TypesGenerator.Result;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.gradle.GradleDependency;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class SpringGeneratorCli extends AbstractGeneratorCli {

    private static final Logger log = LoggerFactory.getLogger(SpringGeneratorCli.class);

    private final List<String> subprojects = new ArrayList<>();

    @Override
    public void runInDownloadFilesModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig) {
        SpringGeneratorContext context = new SpringGeneratorContext(ir, generatorConfig, customConfig);
        generateClient(context, ir);
    }

    @Override
    public void runInGithubModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig,
            GithubOutputMode githubOutputMode) {
        throw new RuntimeException("Github mode is unsupported!");
    }

    @Override
    public void runInPublishModeHook(
            DefaultGeneratorExecClient generatorExecClient,
            GeneratorConfig generatorConfig,
            IntermediateRepresentation ir,
            CustomConfig customConfig,
            GeneratorPublishConfig publishOutputMode) {
        SpringGeneratorContext context = new SpringGeneratorContext(ir, generatorConfig, customConfig);
        generateClient(context, ir);
    }

    public void generateClient(SpringGeneratorContext context, IntermediateRepresentation ir) {

        // core
        ObjectMappersGenerator objectMappersGenerator = new ObjectMappersGenerator(context);
        GeneratedJavaFile objectMapper = objectMappersGenerator.generateFile();
        this.addGeneratedFile(objectMapper);

        // auth
        AuthGenerator authGenerator = new AuthGenerator(context);
        Optional<GeneratedAuthFiles> maybeAuth = authGenerator.generate();
        maybeAuth.ifPresent(this::addGeneratedFile);

        // types
        TypesGenerator typesGenerator = new TypesGenerator(context);
        Result generatedTypes = typesGenerator.generateFiles();
        generatedTypes.getTypes().values().forEach(this::addGeneratedFile);
        generatedTypes.getInterfaces().values().forEach(this::addGeneratedFile);
    }

    @Override
    public List<GradleDependency> getBuildGradleDependencies() {
        return List.of();
    }

    @Override
    public List<String> getSubProjects() {
        return subprojects;
    }

    public static void main(String... args) {
        SpringGeneratorCli cli = new SpringGeneratorCli();
        cli.run(args);
    }
}
