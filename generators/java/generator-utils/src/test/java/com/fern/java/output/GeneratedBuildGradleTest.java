package com.fern.java.output;

import static org.assertj.core.api.Assertions.assertThat;

import com.fern.generator.exec.model.logging.MavenCoordinate;
import com.fern.java.output.gradle.AbstractGradleDependency;
import com.fern.java.output.gradle.GradleDependencyType;
import com.fern.java.output.gradle.GradlePlugin;
import com.fern.java.output.gradle.GradlePublishingConfig;
import com.fern.java.output.gradle.GradleRepository;
import com.fern.java.output.gradle.ParsedGradleDependency;
import com.fern.java.output.gradle.RootProjectGradleDependency;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

public class GeneratedBuildGradleTest {

    @Test
    public void test_generatedBuildGradle() {
        MavenCoordinate mavenCoordinate = MavenCoordinate.builder()
                .group("io.github.fern-api")
                .artifact("fern")
                .version("0.0.0")
                .build();
        List<AbstractGradleDependency> deps = List.of(
                ParsedGradleDependency.builder()
                        .type(GradleDependencyType.IMPLEMENTATION)
                        .group("io.github.fern-api")
                        .artifact("jersy-utils")
                        .version(ParsedGradleDependency.UTILS_VERSION)
                        .build(),
                RootProjectGradleDependency.INSTANCE);
        GeneratedBuildGradle buildGradle = GeneratedBuildGradle.builder()
                .addAllPlugins(List.of(
                        GradlePlugin.builder()
                                .pluginId(GeneratedBuildGradle.JAVA_LIBRARY_PLUGIN_ID)
                                .build(),
                        GradlePlugin.builder()
                                .pluginId(GeneratedBuildGradle.MAVEN_PUBLISH_PLUGIN_ID)
                                .build()))
                .addCustomRepositories(GradleRepository.builder()
                        .url("https://s01.oss.sonatype.org/content/repositories/releases/")
                        .build())
                .gradlePublishingConfig(GradlePublishingConfig.builder()
                        .version(mavenCoordinate.getVersion())
                        .group(mavenCoordinate.getGroup())
                        .artifact(mavenCoordinate.getArtifact())
                        .build())
                .addAllDependencies(deps)
                .shouldSignPackage(false)
                .addCustomBlocks("java {\n" + "    withSourcesJar()\n" + "    withJavadocJar()\n" + "}\n")
                .build();

        System.out.println(buildGradle.getContents());
    }

    @TempDir
    Path tempDir;

    private String invokeExtractLicenseFromFile(String filename) throws Exception {
        GeneratedBuildGradle instance =
                GeneratedBuildGradle.builder().shouldSignPackage(false).build();
        Method method = GeneratedBuildGradle.class.getDeclaredMethod("extractLicenseFromFile", String.class);
        method.setAccessible(true);
        return (String) method.invoke(instance, filename);
    }

    @Test
    public void test_extractLicense_mitLicense() throws Exception {
        Path licenseFile = tempDir.resolve("LICENSE");
        Files.writeString(licenseFile, "MIT License\n\nCopyright (c) 2024 Example Corp\n");
        assertThat(invokeExtractLicenseFromFile(licenseFile.toString())).isEqualTo("MIT");
    }

    @Test
    public void test_extractLicense_apacheLicense() throws Exception {
        Path licenseFile = tempDir.resolve("LICENSE");
        Files.writeString(licenseFile, "Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n");
        assertThat(invokeExtractLicenseFromFile(licenseFile.toString())).isEqualTo("Apache-2.0");
    }

    @Test
    public void test_extractLicense_unknownLicenseReturnsCustomLicense() throws Exception {
        Path licenseFile = tempDir.resolve("LICENSE");
        Files.writeString(licenseFile, "Anduril Technologies Proprietary License\nAll rights reserved.\n");
        assertThat(invokeExtractLicenseFromFile(licenseFile.toString())).isEqualTo("Custom License");
    }

    @Test
    public void test_extractLicense_markdownHeadingStripped() throws Exception {
        Path licenseFile = tempDir.resolve("LICENSE");
        Files.writeString(licenseFile, "# MIT License\n\nCopyright (c) 2024 Example Corp\n");
        assertThat(invokeExtractLicenseFromFile(licenseFile.toString())).isEqualTo("MIT");
    }

    @Test
    public void test_extractLicense_markdownHeadingWithUnknownLicense() throws Exception {
        Path licenseFile = tempDir.resolve("LICENSE");
        Files.writeString(licenseFile, "# Anduril Custom License\n\nSome proprietary terms.\n");
        assertThat(invokeExtractLicenseFromFile(licenseFile.toString())).isEqualTo("Custom License");
    }

    @Test
    public void test_extractLicense_fileNotFound() throws Exception {
        assertThat(invokeExtractLicenseFromFile("/nonexistent/path/LICENSE")).isEqualTo("Custom License (LICENSE)");
    }

    @Test
    public void test_extractLicense_bsd3Clause() throws Exception {
        Path licenseFile = tempDir.resolve("LICENSE");
        Files.writeString(licenseFile, "BSD 3-Clause License\n\nCopyright...\n");
        assertThat(invokeExtractLicenseFromFile(licenseFile.toString())).isEqualTo("BSD-3-Clause");
    }

    @Test
    public void test_extractLicense_multipleMarkdownHeadings() throws Exception {
        Path licenseFile = tempDir.resolve("LICENSE");
        Files.writeString(licenseFile, "## Apache License\n## Version 2.0\nSome text\n");
        assertThat(invokeExtractLicenseFromFile(licenseFile.toString())).isEqualTo("Apache-2.0");
    }
}
