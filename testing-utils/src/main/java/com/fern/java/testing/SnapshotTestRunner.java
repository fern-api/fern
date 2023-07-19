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

package com.fern.java.testing;

import au.com.origin.snapshots.Expect;
import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorEnvironment;
import com.fern.generator.exec.model.config.GeneratorOutputConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GeneratorRegistriesConfig;
import com.fern.generator.exec.model.config.GeneratorRegistriesConfigV2;
import com.fern.generator.exec.model.config.MavenRegistryConfig;
import com.fern.generator.exec.model.config.MavenRegistryConfigV2;
import com.fern.generator.exec.model.config.NpmRegistryConfig;
import com.fern.generator.exec.model.config.NpmRegistryConfigV2;
import com.fern.generator.exec.model.config.OutputMode;
import com.fern.generator.exec.model.config.PypiRegistryConfig;
import com.fern.java.StreamGobbler;
import com.fern.java.jackson.ClientObjectMappers;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class SnapshotTestRunner {

    private SnapshotTestRunner() {}

    public static void snapshotLocalFiles(Path fernDir, Expect expect, String docker, Optional<Object> customConfig)
            throws IOException {
        GeneratorConfig generatorConfig = GeneratorConfig.builder()
                .dryRun(true)
                .irFilepath("/fern/ir.json")
                .output(GeneratorOutputConfig.builder()
                        .path("/fern/output")
                        .mode(OutputMode.downloadFiles())
                        .build())
                .workspaceName("fern")
                .organization("fern")
                .environment(GeneratorEnvironment.local())
                .customConfig(customConfig)
                .build();
        snapshotTest(fernDir, expect, docker, generatorConfig, customConfig, false);
    }

    public static void snapshotGithub(Path fernDir, Expect expect, String docker, Optional<Object> customConfig)
            throws IOException {
        GeneratorConfig generatorConfig = GeneratorConfig.builder()
                .dryRun(true)
                .irFilepath("/fern/ir.json")
                .output(GeneratorOutputConfig.builder()
                        .path("/fern/output")
                        .mode(OutputMode.publish(GeneratorPublishConfig.builder()
                                .registries(GeneratorRegistriesConfig.builder()
                                        .maven(MavenRegistryConfig.builder()
                                                .registryUrl(
                                                        "https://s01.oss.sonatype.org/content/repositories/releases/")
                                                .username("fake")
                                                .password("fake")
                                                .group("com.fern")
                                                .build())
                                        .npm(NpmRegistryConfig.builder()
                                                .registryUrl("")
                                                .token("")
                                                .scope("")
                                                .build())
                                        .build())
                                .registriesV2(GeneratorRegistriesConfigV2.builder()
                                        .maven(MavenRegistryConfigV2.builder()
                                                .registryUrl(
                                                        "https://s01.oss.sonatype.org/content/repositories/releases/")
                                                .username("fake")
                                                .password("fake")
                                                .coordinate("com.fern:basic")
                                                .build())
                                        .npm(NpmRegistryConfigV2.builder()
                                                .registryUrl("")
                                                .token("")
                                                .packageName("")
                                                .build())
                                        .pypi(PypiRegistryConfig.builder()
                                                .registryUrl("")
                                                .username("")
                                                .password("")
                                                .packageName("")
                                                .build())
                                        .build())
                                .version("0.0.0")
                                .build()))
                        .build())
                .workspaceName("fern")
                .organization("fern")
                .environment(GeneratorEnvironment.local())
                .customConfig(customConfig)
                .build();
        snapshotTest(fernDir, expect, docker, generatorConfig, customConfig, true);
    }

    @SuppressWarnings("checkstyle:CyclomaticComplexity")
    public static void snapshotTest(
            Path fernDir,
            Expect expect,
            String docker,
            GeneratorConfig generatorConfig,
            Optional<Object> customConfig,
            boolean compile)
            throws IOException {

        Path tmpDir = Files.createTempDirectory("fern");

        Path pathToOutput = fernDir.resolve("generated-java");
        Path pathToIr = tmpDir.resolve("ir.json");
        Path pathToConfig = tmpDir.resolve("config.json");

        if (pathToOutput.toFile().exists()) {
            runCommand(fernDir, new String[] {"rm", "-rf", "generated-java/"});
        } else {
            pathToOutput.toFile().mkdirs();
        }

        Files.writeString(pathToConfig, ClientObjectMappers.JSON_MAPPER.writeValueAsString(generatorConfig));

        runCommand(fernDir, new String[] {
            "fern", "ir", pathToIr.toAbsolutePath().toString(), "--language", "java", "--version", "v16"
        });

        runCommand(fernDir, new String[] {
            "docker",
            "run",
            "-v",
            pathToIr.toAbsolutePath() + ":/fern/ir.json",
            "-v",
            pathToConfig.toAbsolutePath() + ":/fern/config.json",
            "-v",
            pathToOutput.toAbsolutePath() + ":/fern/output/",
            docker,
            "/fern/config.json",
        });

        if (System.getenv().containsKey("CIRCLECI")) {
            runCommand(pathToOutput, new String[] {"sudo", "git", "init"});
            runCommand(pathToOutput, new String[] {"sudo", "git", "add", "-A"});
            runCommand(pathToOutput, new String[] {"sudo", "git", "commit", "-m", "generate"});
            runCommand(pathToOutput, new String[] {"sudo", "git", "clean", "-fdx"});
            runCommand(pathToOutput, new String[] {"sudo", "rm", "-rf", ".git"});
        } else {
            runCommand(pathToOutput, new String[] {"git", "init"});
            runCommand(pathToOutput, new String[] {"git", "add", "-A"});
            runCommand(pathToOutput, new String[] {"git", "commit", "-m", "generate"});
            runCommand(pathToOutput, new String[] {"git", "clean", "-fdx"});
            runCommand(pathToOutput, new String[] {"rm", "-rf", ".git"});
        }

        try (Stream<Path> pathStream = Files.walk(pathToOutput)) {
            List<Path> paths = pathStream.collect(Collectors.toList());
            boolean filesGenerated = false;
            for (Path path : paths) {
                if (path.toFile().isDirectory()
                        || path.toAbsolutePath().toString().endsWith(".bat")
                        || path.toAbsolutePath().toString().endsWith(".gradle")) {
                    continue;
                }

                Path relativizedPath = pathToOutput.relativize(path);
                filesGenerated = true;
                try {
                    String fileContents = Files.readString(path);
                    expect.scenario(relativizedPath.toString()).toMatchSnapshot(fileContents);
                } catch (IOException e) {
                    // log.error("Encountered error while reading file {}", relativizedPath, e);
                    expect.scenario(relativizedPath.toString()).toMatchSnapshot(relativizedPath.toString());
                }
            }
            if (!filesGenerated) {
                throw new RuntimeException("Failed to generate any files!");
            }
        }

        if (compile && !System.getenv().containsKey("CIRCLECI")) {
            runCommand(pathToOutput, new String[] {"./gradlew", "compileJava"});
        }
    }

    private static void runCommand(Path workingDirPath, String[] command) {
        int exitCode;
        try {
            ProcessBuilder pb = new ProcessBuilder(command).directory(workingDirPath.toFile());

            Map<String, String> env = pb.environment();

            Process process = pb.start();
            StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream());
            StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream());
            errorGobbler.start();
            outputGobbler.start();
            exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Command failed with non-zero exit code: " + Arrays.asList(command));
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to run command: " + Arrays.asList(command), e);
        }
    }
}
