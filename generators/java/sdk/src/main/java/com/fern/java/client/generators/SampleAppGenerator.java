package com.fern.java.client.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.GeneratedRootClient;
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

    private final GeneratedRootClient generatedClientWrapper;

    public static final String SAMPLE_APP_DIRECTORY = "sample-app";

    public SampleAppGenerator(
            AbstractGeneratorContext<?, ?> generatorContext, GeneratedRootClient generatedClientWrapper) {
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
                .shouldSignPackage(false)
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
