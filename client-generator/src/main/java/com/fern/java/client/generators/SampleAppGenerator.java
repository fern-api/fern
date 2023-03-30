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

package com.fern.java.client.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.GeneratedClient;
import com.fern.java.generators.AbstractFilesGenerator;
import com.fern.java.output.GeneratedBuildGradle;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.gradle.GradlePlugin;
import com.fern.java.output.gradle.GradleRepository;
import com.fern.java.output.gradle.RootProjectGradleDependency;
import com.squareup.javapoet.ArrayTypeName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import javax.lang.model.element.Modifier;

public final class SampleAppGenerator extends AbstractFilesGenerator {

    private final GeneratedClient generatedClientWrapper;

    public static final String SAMPLE_APP_DIRECTORY = "sample-app";

    public SampleAppGenerator(AbstractGeneratorContext<?> generatorContext, GeneratedClient generatedClientWrapper) {
        super(generatorContext);
        this.generatedClientWrapper = generatedClientWrapper;
    }

    @Override
    public List<GeneratedFile> generateFiles() {
        GeneratedBuildGradle buildGradle = GeneratedBuildGradle.builder()
                .directoryPrefix(SAMPLE_APP_DIRECTORY)
                .addPlugins(GradlePlugin.builder()
                        .pluginId(GeneratedBuildGradle.JAVA_LIBRARY_PLUGIN_ID)
                        .build())
                .addCustomRepositories(GradleRepository.builder()
                        .url("https://s01.oss.sonatype.org/content/repositories/releases/")
                        .build())
                .addDependencies()
                .addDependencies(RootProjectGradleDependency.INSTANCE)
                .build();
        TypeSpec appTypeSpec = TypeSpec.classBuilder("App")
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(MethodSpec.methodBuilder("main")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addParameter(ArrayTypeName.of(ClassName.get(String.class)), "args")
                        .addComment("import "
                                + generatedClientWrapper.getClassName().toString())
                        .build())
                .build();
        ClassName appClassName = ClassName.get("sample", appTypeSpec.name);
        GeneratedJavaFile appJava = GeneratedJavaFile.builder()
                .className(appClassName)
                .javaFile(JavaFile.builder(appClassName.packageName(), appTypeSpec)
                        .build())
                .directoryPrefix(SAMPLE_APP_DIRECTORY)
                .build();
        return List.of(buildGradle, appJava);
    }
}
